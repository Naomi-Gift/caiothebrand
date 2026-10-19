/**
 * GET /api/cron/erp — daily (vercel.json): retry paid orders that haven't
 * reached ERPNext, then refresh menu prices from ERPNext.
 * Vercel sends "Authorization: Bearer $CRON_SECRET".
 */
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { erpConfig } from "@/lib/erp";
import { retryPendingErpOrders } from "@/lib/erpPush";
import { syncMenuFromErp } from "@/lib/erpSync";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!erpConfig()) return NextResponse.json({ skipped: "ERPNext not configured" });

  const orders = await retryPendingErpOrders();
  let menu: { changes: number; unmatched: number } | { error: string };
  try {
    const r = await syncMenuFromErp({ dryRun: false });
    revalidatePath("/", "layout");
    menu = { changes: r.changes.length, unmatched: r.unmatchedErp.length + r.unmatchedSite.length };
  } catch (err) {
    menu = { error: (err as Error).message };
  }
  return NextResponse.json({ orders, menu });
}
