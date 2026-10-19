/**
 * POST /api/paystack/webhook — Paystack "charge.success" events.
 * Set this URL in Paystack → Settings → API Keys & Webhooks:
 *   https://www.caiopizza.com/api/paystack/webhook
 *
 * Makes sure every paid order exists and reaches ERPNext, even if the
 * customer closed the page right after paying.
 */
import crypto from "node:crypto";
import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { placePaidOrder } from "@/lib/placeOrder";
import { pushOrderToErp } from "@/lib/erpPush";
import type { IncomingLine } from "@/lib/orderPricing";

interface ChargeEvent {
  event?: string;
  data?: {
    reference?: string;
    customer?: { email?: string };
    metadata?: {
      order?: {
        branchId?: string;
        fulfillment?: string;
        lines?: IncomingLine[];
        promoCode?: string | null;
        deliveryAddress?: string | null;
        phone?: string;
      };
    };
  };
}

export async function POST(req: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const expected = secret ? crypto.createHmac("sha512", secret).update(raw).digest("hex") : "";
  if (!secret || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = JSON.parse(raw) as ChargeEvent;
  if (event.event !== "charge.success" || !event.data?.reference) return NextResponse.json({ ok: true });

  const reference = event.data.reference;
  const existing = await prisma.order.findUnique({ where: { paystackRef: reference }, select: { id: true, erpOrderName: true } });
  if (existing) {
    if (!existing.erpOrderName) after(() => pushOrderToErp(existing.id).then(() => undefined));
    return NextResponse.json({ ok: true });
  }

  // The checkout page never saved it (tab closed?): rebuild from the cart we
  // sent along with the payment. placePaidOrder re-verifies with Paystack.
  const meta = event.data.metadata?.order;
  const email = event.data.customer?.email;
  if (!meta || !email) {
    console.error("[paystack/webhook] paid but no order and no cart metadata", reference);
    return NextResponse.json({ ok: true });
  }
  const result = await placePaidOrder({
    customerEmail: email,
    branchId: meta.branchId,
    fulfillment: meta.fulfillment,
    lines: meta.lines,
    promoCode: meta.promoCode,
    paystackRef: reference,
    deliveryAddress: meta.deliveryAddress,
    phone: meta.phone,
  });
  if (!result.ok) console.error("[paystack/webhook] couldn't create order", reference, result.error);
  // Always 200 so Paystack doesn't retry forever; failures are logged.
  return NextResponse.json({ ok: true });
}
