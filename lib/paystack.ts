/** Server-only: confirm a transaction with Paystack (secret key never leaves the server). */
export type VerifiedPayment =
  | { ok: true; reference: string; amountKobo: number; currency: string; email: string | null }
  | { ok: false; status: number; error: string };

export async function verifyPaystackTransaction(reference: string): Promise<VerifiedPayment> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return { ok: false, status: 503, error: "Payment service not configured." };

  let res: Response;
  try {
    res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
      cache: "no-store",
    });
  } catch (err) {
    console.error("[paystack] verify request failed", err);
    return { ok: false, status: 502, error: "Couldn't reach the payment service. Please contact the branch." };
  }

  const data = (await res.json().catch(() => null)) as {
    status?: boolean;
    message?: string;
    data?: { status?: string; reference?: string; amount?: number; currency?: string; customer?: { email?: string } };
  } | null;

  if (!res.ok || !data?.status || data.data?.status !== "success") {
    return { ok: false, status: 402, error: "Payment was not successful." };
  }

  return {
    ok: true,
    reference: data.data.reference ?? reference,
    amountKobo: data.data.amount ?? 0,
    currency: data.data.currency ?? "NGN",
    email: data.data.customer?.email ?? null,
  };
}
