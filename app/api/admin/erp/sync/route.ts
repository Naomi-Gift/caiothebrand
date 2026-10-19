/** POST /api/admin/erp/sync { dryRun } — admin: pull prices/sizes/codes from ERPNext. */
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { erpConfig } from "@/lib/erp";
import { syncMenuFromErp } from "@/lib/erpSync";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  if (!erpConfig()) return NextResponse.json({ error: "ERPNext isn't connected yet (ERP_* settings missing)." }, { status: 503 });
  const { dryRun = true } = (await req.json().catch(() => ({}))) as { dryRun?: boolean };
  try {
    const report = await syncMenuFromErp({ dryRun });
    if (!dryRun) revalidatePath("/", "layout");
    return NextResponse.json(report);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
