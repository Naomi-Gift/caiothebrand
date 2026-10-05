import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackTransaction } from "@/lib/paystack";

/**
 * POST /api/paystack/verify
 * Body: { reference: string }
 *
 * Confirms a transaction with Paystack server-side. Order creation
 * (/api/orders) runs the same check itself; this stays for other callers.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { reference?: unknown };
  if (typeof body.reference !== "string" || !body.reference.trim()) {
    return NextResponse.json({ error: "Missing or invalid reference." }, { status: 400 });
  }
  const result = await verifyPaystackTransaction(body.reference.trim());
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({
    reference: result.reference,
    amount: result.amountKobo, // kobo
    currency: result.currency,
    email: result.email,
  });
}
