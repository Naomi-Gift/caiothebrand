import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { auth } from "@/auth";
import { branches } from "@/lib/data/branches";
import { priceLines, PricingError, type IncomingLine } from "@/lib/orderPricing";
import { findPromo } from "@/lib/promo";
import { verifyPaystackTransaction } from "@/lib/paystack";

/**
 * POST /api/orders — create an order after payment.
 * Everything that matters is checked here, not in the browser:
 *   1. the customer is signed in (the order is linked to their account)
 *   2. prices are recomputed from the menu in the database
 *   3. the promo code is looked up server-side
 *   4. Paystack confirms the payment, in NGN, for at least the order total
 *   5. a payment reference can only ever create one order
 */
interface CreateOrderBody {
  branchId?: unknown;
  fulfillment?: unknown;
  lines?: IncomingLine[];
  promoCode?: unknown;
  paystackRef?: unknown;
  deliveryAddress?: unknown;
}

function fail(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return fail("Please sign in to place an order.", 401);

  let body: CreateOrderBody;
  try {
    body = (await req.json()) as CreateOrderBody;
  } catch {
    return fail("Invalid request body.", 400);
  }

  const branchId = typeof body.branchId === "string" && body.branchId in branches ? body.branchId : null;
  const fulfillment = body.fulfillment === "DELIVERY" || body.fulfillment === "PICKUP" ? body.fulfillment : null;
  const paystackRef = typeof body.paystackRef === "string" ? body.paystackRef.trim().slice(0, 100) : "";
  if (!branchId || !fulfillment || !paystackRef) return fail("Missing required fields.", 400);

  const deliveryAddress =
    fulfillment === "DELIVERY" && typeof body.deliveryAddress === "string"
      ? body.deliveryAddress.trim().slice(0, 300) || null
      : null;

  // A payment reference only ever creates one order (safe to retry).
  const existing = await prisma.order.findUnique({ where: { paystackRef }, select: { id: true, createdAt: true } });
  if (existing) return NextResponse.json(existing);

  let priced: Awaited<ReturnType<typeof priceLines>>;
  try {
    priced = await priceLines(body.lines ?? []);
  } catch (err) {
    if (err instanceof PricingError) return fail(err.message, 400);
    throw err;
  }

  const promo = await findPromo(typeof body.promoCode === "string" ? body.promoCode : null);
  const discount = promo ? Math.round(priced.subtotal * promo.rate) : 0;
  const total = priced.subtotal - discount;

  const payment = await verifyPaystackTransaction(paystackRef);
  if (!payment.ok) return fail(payment.error, payment.status);
  if (payment.currency !== "NGN" || payment.amountKobo < Math.round(total * 100)) {
    console.error("[api/orders] amount mismatch", { paystackRef, paid: payment.amountKobo, expected: Math.round(total * 100) });
    return fail(
      `We received your payment (reference ${paystackRef}) but the amount doesn't match your order. Please contact the branch.`,
      409
    );
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, name: true } });

  try {
    const order = await prisma.order.create({
      data: {
        branchId,
        fulfillment,
        subtotal: priced.subtotal,
        discount,
        total,
        promoCode: promo?.code ?? null,
        paystackRef,
        deliveryAddress,
        customerEmail: session.user.email,
        customerName: user?.name ?? session.user.name ?? null,
        userId: user?.id ?? null,
        lines: {
          create: priced.lines.map((l) => ({
            name: l.name,
            descriptor: l.descriptor,
            sizeLabel: l.sizeLabel,
            addOns: l.addOns,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            menuItem: { connect: { id: l.menuItemId } },
          })),
        },
      },
      select: { id: true, createdAt: true, total: true },
    });
    return NextResponse.json(order);
  } catch (err) {
    // Two requests for the same payment at once: return the one that won.
    const again = await prisma.order.findUnique({ where: { paystackRef }, select: { id: true, createdAt: true } });
    if (again) return NextResponse.json(again);
    console.error("[api/orders] create error", err);
    return fail(`Your payment went through (reference ${paystackRef}) but we couldn't save the order. Please contact the branch.`, 500);
  }
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
