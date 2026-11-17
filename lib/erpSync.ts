/**
 * ERPNext → website menu sync. ERPNext owns prices, sizes and item codes;
 * the website keeps its own photos, descriptions and "featured" flags.
 * Products are matched by name. A product that's in ERPNext but not on the
 * website is added hidden (Pizzas, Drinks or Sides), for an admin to check —
 * a near-miss name would otherwise show up twice — add a photo and switch
 * on. Website products ERPNext doesn't know are reported.
 *
 * Runs on its own (autoSyncMenu, at most every 15 minutes while people use
 * the site, plus the daily cron) and from the admin "Apply sync" button.
 */
import { prisma } from "@/lib/prisma";
import { getCatalog, type ErpItem } from "@/lib/erp";
import type { AddOnOption, SizeOption } from "@/lib/types";

const TOPPINGS_GROUP = "pizza toppings";

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/\d+(\.\d+)?\s*("|inch(es)?|cl|ml|l)\b/g, "") // sizes like 12" / 50CL
    .replace(/[^a-z0-9]/g, "");

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const SIZE_IDS: Record<number, string> = { 9: "selfie", 10: "medium", 12: "large", 16: "extra-large" };

export interface SyncChange {
  item: string;
  what: string;
}

export interface SyncReport {
  dryRun: boolean;
  outlet: string;
  changes: SyncChange[];
  /** Created from ERPNext, hidden until an admin switches them on. */
  added: string[];
  unmatchedErp: string[];
  unmatchedSite: string[];
  toppings: number;
}

export async function syncMenuFromErp({ dryRun }: { dryRun: boolean }): Promise<SyncReport> {
  const outlet = await getCatalog();
  if (!outlet) throw new Error("ERPNext returned no outlet for this POS profile.");

  const siteItems = await prisma.menuItem.findMany({ include: { category: { select: { slug: true } } } });
  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const categoryId = (slug: string) => categories.find((c) => c.slug === slug)?.id ?? categories[0]?.id;
  const slugs = new Set(siteItems.map((i) => i.slug));
  const freeSlug = (name: string) => {
    const base = slugify(name) || "item";
    let slug = base;
    for (let n = 2; slugs.has(slug); n++) slug = `${base}-${n}`;
    slugs.add(slug);
    return slug;
  };
  const added: string[] = [];
  const byName = new Map(siteItems.map((i) => [norm(i.name), i]));
  const matchedSite = new Set<string>();
  const changes: SyncChange[] = [];
  const unmatchedErp: string[] = [];
  const writes: (() => Promise<unknown>)[] = [];

  const findSite = (name: string) => {
    const n = norm(name);
    if (byName.has(n)) return byName.get(n)!;
    // One name contained in the other (e.g. "Coca Cola" vs "Coca-Cola 50cl"), only if unambiguous.
    const hits = siteItems.filter((i) => n.length >= 4 && (norm(i.name).includes(n) || n.includes(norm(i.name))));
    return hits.length === 1 ? hits[0] : undefined;
  };

  // Toppings → pizza add-ons
  const toppingItems = outlet.items.filter((i) => i.item_group.toLowerCase() === TOPPINGS_GROUP);
  const toppings: AddOnOption[] = toppingItems
    .map((t) => ({ id: slugify(t.item_name), label: t.item_name, price: t.rate, itemCode: t.item_code }))
    .sort((a, b) => a.label.localeCompare(b.label));

  // Pizzas: one site card per ERP family, sizes from ERP
  for (const fam of outlet.pizza_families) {
    const site = findSite(fam.pizza_family_name);
    const ordered = [...fam.sizes].sort((a, b) => a.size_inches - b.size_inches);
    if (!site) {
      if (!ordered.length) {
        unmatchedErp.push(`${fam.pizza_family_name} (pizza, no sizes in ERPNext)`);
        continue;
      }
      const base = ordered[0].rate;
      const sizes = ordered.map((s) => ({ id: SIZE_IDS[s.size_inches] ?? `${s.size_inches}in`, label: s.size_label, priceDelta: s.rate - base, itemCode: s.item_code }));
      added.push(`${fam.pizza_family_name} (pizza)`);
      writes.push(() =>
        prisma.menuItem.create({
          data: {
            name: fam.pizza_family_name,
            slug: freeSlug(fam.pizza_family_name),
            basePrice: base,
            categoryId: categoryId("pizzas")!,
            sizes: sizes as object[],
            addOns: toppings as object[],
            available: false,
          },
        })
      );
      continue;
    }
    matchedSite.add(site.id);
    const base = ordered[0]?.rate ?? site.basePrice;
    const sizes: SizeOption[] = ordered.map((s) => ({
      id: SIZE_IDS[s.size_inches] ?? `${s.size_inches}in`,
      label: s.size_label,
      priceDelta: s.rate - base,
      itemCode: s.item_code,
    }));
    const addOns = toppings.length ? toppings : (site.addOns as unknown as AddOnOption[]);
    const priceText = ordered.map((s) => `${s.size_label} ₦${s.rate.toLocaleString()}`).join(", ");
    if (site.basePrice !== base || JSON.stringify(site.sizes) !== JSON.stringify(sizes) || JSON.stringify(site.addOns) !== JSON.stringify(addOns)) {
      changes.push({ item: site.name, what: priceText });
    }
    writes.push(() =>
      prisma.menuItem.update({
        where: { id: site.id },
        data: { basePrice: base, sizes: sizes as object[], addOns: addOns as object[], erpItemCode: null },
      })
    );
  }

  // Everything else that's sellable on its own (sides, drinks…)
  const singles = outlet.items.filter(
    (i: ErpItem) => !i.pizza_family && i.item_group.toLowerCase() !== TOPPINGS_GROUP
  );
  for (const it of singles) {
    const site = findSite(it.item_name);
    if (site && matchedSite.has(site.id)) {
      unmatchedErp.push(`${it.item_name} (${it.item_group})`);
      continue;
    }
    if (!site) {
      const cat = /drink|beverage|soda|juice|water|wine|beer|cocktail|mocktail/i.test(it.item_group) ? "drinks" : "sides";
      added.push(`${it.item_name} (${cat})`);
      writes.push(() =>
        prisma.menuItem.create({
          data: {
            name: it.item_name,
            slug: freeSlug(it.item_name),
            basePrice: it.rate,
            erpItemCode: it.item_code,
            categoryId: categoryId(cat)!,
            sizes: [{ id: "regular", label: "Regular", priceDelta: 0, itemCode: it.item_code }],
            addOns: [],
            available: false,
          },
        })
      );
      continue;
    }
    matchedSite.add(site.id);
    const current = (site.sizes as unknown as SizeOption[])[0];
    const sizes: SizeOption[] = [{ id: current?.id ?? "regular", label: current?.label ?? "Regular", priceDelta: 0, itemCode: it.item_code }];
    if (site.basePrice !== it.rate || site.erpItemCode !== it.item_code) {
      changes.push({ item: site.name, what: `₦${it.rate.toLocaleString()} (${it.item_code})` });
    }
    writes.push(() =>
      prisma.menuItem.update({
        where: { id: site.id },
        data: { basePrice: it.rate, erpItemCode: it.item_code, sizes: sizes as object[] },
      })
    );
  }

  const unmatchedSite = siteItems.filter((i) => !matchedSite.has(i.id) && i.available).map((i) => i.name);

  if (!dryRun) {
    for (const w of writes) await w();
  }

  return { dryRun, outlet: `${outlet.brand} — ${outlet.location}`, changes, added, unmatchedErp, unmatchedSite, toppings: toppings.length };
}

const AUTO_SYNC_KEY = "erp_menu_synced_at";
const AUTO_SYNC_EVERY_MS = 15 * 60 * 1000;

/**
 * Keep the menu in step with ERPNext without anyone pressing a button:
 * called in the background when the menu is rendered, it syncs at most once
 * every 15 minutes (the first caller claims the slot, so it never runs twice
 * at once). Pages re-render every 60s, so changes show within a minute after.
 */
export async function autoSyncMenu(): Promise<void> {
  const now = Date.now();
  const row = await prisma.setting.findUnique({ where: { key: AUTO_SYNC_KEY } });
  const last = row ? Number(row.value) || 0 : 0;
  if (now - last < AUTO_SYNC_EVERY_MS) return;
  // Claim the slot: only succeeds for one caller.
  if (row) {
    const claimed = await prisma.setting.updateMany({ where: { key: AUTO_SYNC_KEY, value: row.value }, data: { value: String(now) } });
    if (claimed.count === 0) return;
  } else {
    try {
      await prisma.setting.create({ data: { key: AUTO_SYNC_KEY, value: String(now) } });
    } catch {
      return; // someone else just created it
    }
  }
  try {
    const r = await syncMenuFromErp({ dryRun: false });
    if (r.changes.length || r.added.length) console.log("[erp] menu auto-sync", { changed: r.changes.length, added: r.added });
  } catch (err) {
    console.error("[erp] menu auto-sync failed", (err as Error).message);
  }
}
