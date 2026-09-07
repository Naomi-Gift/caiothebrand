/**
 * GET /api/analytics
 * Returns revenue totals, order counts by status, daily revenue for last 30 days,
 * and top 10 bestselling items.
 * Admin only.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return adminAuth.response;

  const [orders, lines] = await Promise.all([
    prisma.order.findMany({
      select: { status: true, total: true, discount: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.orderLine.findMany({
      select: { name: true, quantity: true, unitPrice: true },
    }),
  ]);

  // ── Revenue summary ───────────────────────────────────────────────────────
  const paid = orders.filter(o => o.status !== "CANCELLED");
  const totalRevenue  = paid.reduce((s, o) => s + o.total, 0);
  const totalDiscount = paid.reduce((s, o) => s + o.discount, 0);
  const totalOrders   = orders.length;

  // ── Order counts by status ────────────────────────────────────────────────
  const byStatus: Record<string, number> = {};
  for (const o of orders) byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;

  // ── Daily revenue — last 30 days ──────────────────────────────────────────
  const now   = new Date();
  const since = new Date(now);
  since.setDate(since.getDate() - 29);

  const dailyMap: Record<string, number> = {};
  for (let d = new Date(since); d <= now; d.setDate(d.getDate() + 1)) {
    dailyMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const o of paid) {
    const day = new Date(o.createdAt).toISOString().slice(0, 10);
    if (day in dailyMap) dailyMap[day] += o.total;
  }
  const daily = Object.entries(dailyMap).map(([date, revenue]) => ({ date, revenue }));

  // ── Bestsellers ───────────────────────────────────────────────────────────
  const itemMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  for (const l of lines) {
    if (!itemMap[l.name]) itemMap[l.name] = { name: l.name, qty: 0, revenue: 0 };
    itemMap[l.name].qty     += l.quantity;
    itemMap[l.name].revenue += l.quantity * l.unitPrice;
  }
  const bestsellers = Object.values(itemMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  return NextResponse.json({ totalRevenue, totalDiscount, totalOrders, byStatus, daily, bestsellers });
}
