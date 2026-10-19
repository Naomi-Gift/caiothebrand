/** POST /api/admin/erp/retry { orderId } — admin: push one order to ERPNext again. */
import { NextRequest, NextResponse } from "next/server";
import { canSeeBranch, requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { pushOrderToErp } from "@/lib/erpPush";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  const { orderId } = (await req.json().catch(() => ({}))) as { orderId?: string };
  if (!orderId) return NextResponse.json({ error: "orderId required." }, { status: 400 });
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { branchId: true } });
  if (!order || !canSeeBranch(admin, order.branchId)) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const result = await pushOrderToErp(orderId);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
