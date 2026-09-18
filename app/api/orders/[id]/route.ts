/**
 * GET   /api/orders/[id]  — admin or owner: get single order
 * PATCH /api/orders/[id]  — admin only: update status
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

type Params = { params: Promise<{ id: string }> };

const VALID_STATUSES = ["RECEIVED", "KITCHEN", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

export async function GET(_req: NextRequest, { params }: Params) {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return adminAuth.response;

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      lines: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
  if (!order) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return adminAuth.response;

  const { id } = await params;
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const { status } = body;
  if (!status || !VALID_STATUSES.includes(String(status).toUpperCase() as OrderStatus)) {
    return NextResponse.json(
      { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status: String(status).toUpperCase() as OrderStatus },
    include: { lines: true },
  });

  return NextResponse.json(order);
}
