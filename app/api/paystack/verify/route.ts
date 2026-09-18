import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/paystack/verify
 * Body: { reference: string }
 *
 * Calls Paystack's transaction verify endpoint server-side (secret key never
 * leaves the server) and returns the verified transaction data to the client.
 */
export async function POST(req: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Payment service not configured." },
      { status: 503 }
    );
  }

  let reference: string;
  try {
    const body = (await req.json()) as { reference?: unknown };
    if (typeof body.reference !== "string" || !body.reference.trim()) {
      return NextResponse.json(
        { error: "Missing or invalid reference." },
        { status: 400 }
      );
    }
    reference = body.reference.trim();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const paystackRes = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      // Never cache verification calls — each reference is one-time.
      cache: "no-store",
    }
  );

  if (!paystackRes.ok) {
    const text = await paystackRes.text();
    console.error("[paystack/verify] upstream error", paystackRes.status, text);
    return NextResponse.json(
      { error: "Could not verify payment. Please contact support." },
      { status: 502 }
    );
  }

  const data = (await paystackRes.json()) as {
    status: boolean;
    message: string;
    data?: {
      status: string;
      reference: string;
      amount: number; // kobo
      currency: string;
      customer?: { email: string };
    };
  };

  if (!data.status || data.data?.status !== "success") {
    return NextResponse.json(
      { error: "Payment was not successful.", detail: data.message },
      { status: 402 }
    );
  }

  return NextResponse.json({
    reference: data.data.reference,
    amount: data.data.amount,   // kobo
    currency: data.data.currency,
    email: data.data.customer?.email ?? null,
  });
}
