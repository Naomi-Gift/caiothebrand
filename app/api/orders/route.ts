import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { auth } from "@/auth";
import type { IncomingLine } from "@/lib/orderPricing";
import { placePaidOrder } from "@/lib/placeOrder";

/** POST /api/orders — save a paid order. All checks live in lib/placeOrder.ts. */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Please sign in to place an order." }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

  const result = await placePaidOrder({
    customerEmail: session.user.email,
    branchId: body.branchId,
    fulfillment: body.fulfillment,
    lines: body.lines as IncomingLine[] | undefined,
    promoCode: body.promoCode,
    paystackRef: body.paystackRef,
    deliveryAddress: body.deliveryAddress,
    phone: body.phone,
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result.order);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const status = searchParams.get("status");

  // Customer order history: only your own (admins may look up anyone's).
  if (email) {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isAdmin = (session?.user as any)?.role === "ADMIN";
    if (!session?.user?.email || (!isAdmin && session.user.email.toLowerCase() !== email.toLowerCase())) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    try {
      const orders = await prisma.order.findMany({
        where: { customerEmail: email },
        include: { lines: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      return NextResponse.json(orders);
    } catch (err) {
      console.error("[api/orders] fetch error", err);
      return NextResponse.json({ error: "Could not fetch orders." }, { status: 500 });
    }
  }

  // Admin order listing
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return adminAuth.response;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    const orders = await prisma.order.findMany({
      where,
      include: {
        lines: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (err) {
    console.error("[api/orders] admin fetch error", err);
    return NextResponse.json({ error: "Could not fetch orders." }, { status: 500 });
  }
}
