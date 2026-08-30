/**
 * GET  /api/orders   — admin only: list all orders (newest first)
 * POST /api/orders   — public (authenticated or guest): create a new order after payment
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { auth } from "@/auth";

export async function GET() {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return adminAuth.response;

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      lines: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const { branchId, fulfillment, lines, subtotal, discount, total,
          promoCode, paystackRef, deliveryAddress, customerEmail, customerName } = body;

  if (!branchId || !fulfillment || !Array.isArray(lines) || lines.length === 0 || !total) {
    return NextResponse.json(
      { error: "branchId, fulfillment, lines and total are required." },
      { status: 400 }
    );
  }

  if (!["DELIVERY", "PICKUP"].includes(String(fulfillment).toUpperCase())) {
    return NextResponse.json({ error: "fulfillment must be DELIVERY or PICKUP." }, { status: 400 });
  }

  // Attach to user if signed in
  const session = await auth();
  const userId = session?.user?.email
    ? (await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }))?.id ?? null
    : null;

  const order = await prisma.order.create({
    data: {
      userId,
      branchId: String(branchId),
      fulfillment: String(fulfillment).toUpperCase() as "DELIVERY" | "PICKUP",
      subtotal: Number(subtotal ?? total),
      discount: Number(discount ?? 0),
      total: Number(total),
      promoCode: promoCode ? String(promoCode) : null,
      paystackRef: paystackRef ? String(paystackRef) : null,
      deliveryAddress: deliveryAddress ? String(deliveryAddress) : null,
      customerEmail: customerEmail ? String(customerEmail) : null,
      customerName: customerName ? String(customerName) : null,
      lines: {
        create: (lines as Array<Record<string, unknown>>).map((l) => ({
          menuItemId: l.itemId ? String(l.itemId) : null,
          name: String(l.name),
          descriptor: l.descriptor ? String(l.descriptor) : null,
          sizeLabel: String((l.size as Record<string, unknown>)?.label ?? l.sizeLabel ?? ""),
          addOns: (l.addOns as object) ?? [],
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
        })),
      },
    },
    include: { lines: true },
  });

  return NextResponse.json(order, { status: 201 });
}
