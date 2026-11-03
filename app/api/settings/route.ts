/**
 * GET  /api/settings  — admin: get all settings as { key: value } map
 * POST /api/settings  — admin: upsert one or many settings { key, value }[]
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { revalidatePath, revalidateTag } from "next/cache";
import { SETTINGS_TAG } from "@/lib/branchSettings";

export async function GET() {
  const adminAuth = await requireAdmin({ fullAdmin: true });
  if (!adminAuth.ok) return adminAuth.response;

  const rows = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return NextResponse.json(map);
}

export async function POST(req: NextRequest) {
  const adminAuth = await requireAdmin({ fullAdmin: true });
  if (!adminAuth.ok) return adminAuth.response;

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const pairs = Array.isArray(body) ? body as Array<{ key: string; value: string }> : [body as { key: string; value: string }];

  // Paystack subaccount codes look like ACCT_xxxxxxxx; catch typos before they break checkout.
  for (const { key, value } of pairs) {
    if (/^branch_\w+_paystack_subaccount$/.test(key) && value && !/^ACCT_[A-Za-z0-9]{6,}$/.test(String(value).trim())) {
      return NextResponse.json({ error: `"${value}" doesn't look like a Paystack subaccount code (it should start with ACCT_).` }, { status: 400 });
    }
  }

  await Promise.all(
    pairs.map(({ key, value }) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )
  );

  // Branch details, promo codes etc. show up on the site straight away.
  revalidateTag(SETTINGS_TAG, "max");
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
