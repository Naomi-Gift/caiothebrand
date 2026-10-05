/** POST /api/orders/quote — the server's total for a cart, charged before payment. */
import { NextRequest, NextResponse } from "next/server";
import { priceLines, PricingError, type IncomingLine } from "@/lib/orderPricing";
import { findPromo } from "@/lib/promo";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { lines?: IncomingLine[]; promoCode?: unknown };
  try {
    const { subtotal } = await priceLines(body.lines ?? []);
    const promo = await findPromo(typeof body.promoCode === "string" ? body.promoCode : null);
    const discount = promo ? Math.round(subtotal * promo.rate) : 0;
    return NextResponse.json({ subtotal, discount, total: subtotal - discount, promoCode: promo?.code ?? null });
  } catch (err) {
    if (err instanceof PricingError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error("[api/orders/quote] failed", err);
    return NextResponse.json({ error: "Couldn't price your order just now. Please try again." }, { status: 503 });
  }
}
