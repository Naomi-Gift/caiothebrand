/** Server-only: confirm a transaction with Paystack (secret key never leaves the server). */
export type VerifiedPayment =
  | { ok: true; reference: string; amountKobo: number; currency: string; email: string | null; subaccount: string | null }
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
    data?: {
      status?: string;
      reference?: string;
      amount?: number;
      currency?: string;
      customer?: { email?: string };
      subaccount?: { subaccount_code?: string } | null;
    };
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
    subaccount: data.data.subaccount?.subaccount_code ?? null,
  };
}

/**
 * Start a payment on the server, so the amount, reference and the branch's
 * subaccount can't be changed in the browser. The checkout popup then
 * resumes it with the returned access code.
 */
export async function initializePaystackTransaction(input: {
  email: string;
  amountKobo: number;
  reference: string;
  subaccount?: string;
  bearer?: "account" | "subaccount";
  metadata: Record<string, unknown>;
}): Promise<{ ok: true; accessCode: string; reference: string } | { ok: false; status: number; error: string }> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return { ok: false, status: 503, error: "Payment service not configured." };
  try {
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: input.email,
        amount: input.amountKobo,
        currency: "NGN",
        reference: input.reference,
        metadata: input.metadata,
        ...(input.subaccount ? { subaccount: input.subaccount, bearer: input.bearer ?? "account" } : {}),
      }),
      cache: "no-store",
    });
    const data = (await res.json().catch(() => null)) as { status?: boolean; message?: string; data?: { access_code?: string; reference?: string } } | null;
    if (!res.ok || !data?.status || !data.data?.access_code) {
      console.error("[paystack] initialize failed", res.status, data?.message);
      return { ok: false, status: 502, error: data?.message ? `Payment couldn't start: ${data.message}` : "Payment couldn't start. Please try again." };
    }
    return { ok: true, accessCode: data.data.access_code, reference: data.data.reference ?? input.reference };
  } catch (err) {
    console.error("[paystack] initialize error", err);
    return { ok: false, status: 502, error: "Couldn't reach the payment service. Please try again." };
  }
}
