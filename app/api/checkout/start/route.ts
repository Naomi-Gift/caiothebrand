/**
 * POST /api/checkout/start — price the cart on the server and start the
 * Paystack payment, routed to the ordering branch's subaccount.
 * The browser only gets an access code: it can't change the amount, the
 * reference or which account is paid. /api/orders re-verifies afterwards.
 */
import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getBranches } from "@/lib/branchSettings";
import { priceLines, PricingError, type IncomingLine } from "@/lib/orderPricing";
import { findPromo } from "@/lib/promo";
import { cleanPhone } from "@/lib/placeOrder";
import { initializePaystackTransaction } from "@/lib/paystack";
import { paystackFee } from "@/lib/paystackFee";
import type { BranchId } from "@/lib/types";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Please sign in to check out." }, { status: 401 });

  const body = (await req.json().catch(() => null)) as {
    branchId?: unknown;
    fulfillment?: unknown;
    lines?: IncomingLine[];
    promoCode?: unknown;
    phone?: unknown;
    deliveryAddress?: unknown;
    expectedTotal?: unknown;
    confirmTotal?: unknown;
  } | null;
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const branches = await getBranches();
  const branchId = typeof body.branchId === "string" && body.branchId in branches ? (body.branchId as BranchId) : null;
  const fulfillment = body.fulfillment === "DELIVERY" || body.fulfillment === "PICKUP" ? body.fulfillment : null;
  if (!branchId || !fulfillment) return NextResponse.json({ error: "Please choose a branch and delivery or pickup." }, { status: 400 });
  const branch = branches[branchId];
  if (branch.comingSoon) return NextResponse.json({ error: `Caio ${branch.name} isn't open yet.` }, { status: 400 });
  const phone = cleanPhone(body.phone);
  if (!phone) return NextResponse.json({ error: "Please add a phone number so the branch can reach you." }, { status: 400 });

  let subtotal: number;
  try {
    ({ subtotal } = await priceLines(body.lines ?? []));
  } catch (err) {
    if (err instanceof PricingError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error("[checkout/start] pricing failed", err);
    return NextResponse.json({ error: "Couldn't price your order just now. Please try again." }, { status: 503 });
  }
  const promo = await findPromo(typeof body.promoCode === "string" ? body.promoCode : null);
  const total = subtotal - (promo ? Math.round(subtotal * promo.rate) : 0);

  // Menu prices changed since the cart was filled: show the real total first.
  if (body.expectedTotal !== total && body.confirmTotal !== total) {
    return NextResponse.json({ priceChanged: true, total });
  }

  const deliveryAddress =
    fulfillment === "DELIVERY" && typeof body.deliveryAddress === "string" ? body.deliveryAddress.trim().slice(0, 300) || null : null;
  const fee = paystackFee(total);
  const reference = `CAIO-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  const started = await initializePaystackTransaction({
    email: session.user.email,
    // The customer pays Paystack's fee on top of the food total.
    amountKobo: Math.round((total + fee) * 100),
    reference,
    subaccount: branch.paystackSubaccount,
    bearer: branch.paystackBearer,
    // The cart travels with the payment so the Paystack webhook can still
    // create the order if the tab is closed right after paying.
    metadata: {
      branchId,
      fulfillment: fulfillment.toLowerCase(),
      promoCode: promo?.code ?? undefined,
      order: {
        branchId,
        fulfillment,
        promoCode: promo?.code ?? null,
        phone,
        deliveryAddress,
        lines: (body.lines ?? []).map((l) => ({
          itemId: l.itemId,
          size: { id: l.size?.id, label: l.size?.label },
          addOns: (l.addOns ?? []).map((a) => ({ id: a.id, label: a.label })),
          quantity: l.quantity,
        })),
      },
    },
  });
  if (!started.ok) return NextResponse.json({ error: started.error }, { status: started.status });
  return NextResponse.json({ accessCode: started.accessCode, reference: started.reference, total, fee });
}
