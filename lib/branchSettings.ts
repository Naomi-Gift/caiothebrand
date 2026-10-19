/**
 * Branches as configured in Admin → Settings, over the code defaults in
 * lib/data/branches.ts. Lets the client open a branch, change its details or
 * point it at an ERPNext outlet without a developer.
 *
 * Setting keys per branch id (lagos, owerri):
 *   branch_<id>_status        "open" | "coming_soon"
 *   branch_<id>_address / _hours / _phone / _whatsapp
 *   delivery_estimate_<id>
 *   erp_pos_profile_<id>      e.g. POS-CAIO
 *   branch_<id>_alert_to      staff WhatsApp number(s) for new-order alerts
 */
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { branches as defaults } from "@/lib/data/branches";
import type { Branch, BranchId } from "@/lib/types";

export const BRANCH_IDS = Object.keys(defaults) as BranchId[];
export const SETTINGS_TAG = "settings";

async function readSettings(): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany({
    where: { OR: [{ key: { startsWith: "branch_" } }, { key: { startsWith: "delivery_estimate_" } }, { key: { startsWith: "erp_pos_profile_" } }] },
  });
  return Object.fromEntries(rows.map((r) => [r.key, r.value.trim()]));
}

function merge(map: Record<string, string>): Record<BranchId, Branch> {
  const out = {} as Record<BranchId, Branch>;
  for (const id of BRANCH_IDS) {
    const d = defaults[id];
    const get = (k: string) => map[k] || undefined;
    const status = get(`branch_${id}_status`);
    const address = get(`branch_${id}_address`);
    const phone = get(`branch_${id}_phone`);
    out[id] = {
      ...d,
      address: address ?? d.address,
      mapsQuery: address ? encodeURIComponent(address) : d.mapsQuery,
      hours: get(`branch_${id}_hours`) ?? d.hours,
      phone: phone ?? d.phone,
      whatsapp: get(`branch_${id}_whatsapp`) ?? phone ?? d.whatsapp,
      deliveryEstimate: get(`delivery_estimate_${id}`) ?? d.deliveryEstimate,
      comingSoon: status ? status !== "open" : d.comingSoon,
      alertWhatsapp: get(`branch_${id}_alert_to`),
      erpPosProfile:
        get(`erp_pos_profile_${id}`) ??
        (id === "lagos" ? process.env.ERP_POS_PROFILE || d.erpPosProfile : d.erpPosProfile),
    };
  }
  return out;
}

// Only successful reads are cached (a DB hiccup must not pin the defaults).
const cachedSettings = unstable_cache(readSettings, ["branch-settings-v1"], { revalidate: 300, tags: [SETTINGS_TAG] });

/** Cached; saving settings clears it (revalidateTag(SETTINGS_TAG)). */
export async function getBranches(): Promise<Record<BranchId, Branch>> {
  try {
    return merge(await cachedSettings());
  } catch (err) {
    console.error("[branches] couldn't read settings, using defaults", err);
    return merge({});
  }
}

export async function getBranchList(): Promise<Branch[]> {
  const all = await getBranches();
  return BRANCH_IDS.map((id) => all[id]);
}
