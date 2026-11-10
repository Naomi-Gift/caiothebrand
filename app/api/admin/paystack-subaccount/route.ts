/** GET /api/admin/paystack-subaccount?code=ACCT_… — full admin: ask Paystack
 * whether a subaccount code exists for the site's key (live or test), and
 * which bank account it pays into. If not, list the codes that key can see. */
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

interface PaystackSubaccount {
  subaccount_code?: string;
  business_name?: string;
  settlement_bank?: string;
  account_number?: string;
  account_name?: string | null;
  percentage_charge?: number;
  active?: boolean;
}

const summary = (s: PaystackSubaccount) => ({
  code: s.subaccount_code ?? "",
  businessName: s.business_name ?? "",
  bank: s.settlement_bank ?? "",
  accountNumber: s.account_number ? `••••${s.account_number.slice(-4)}` : "",
  accountName: s.account_name ?? null,
  percentageCharge: s.percentage_charge ?? null,
  active: s.active !== false,
});

export async function GET(req: NextRequest) {
  const admin = await requireAdmin({ fullAdmin: true });
  if (!admin.ok) return admin.response;
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return NextResponse.json({ ok: false, error: "PAYSTACK_SECRET_KEY isn't set on the server." }, { status: 503 });
  const mode = secretKey.startsWith("sk_live_") ? "live" : secretKey.startsWith("sk_test_") ? "test" : "unknown";

  const code = (req.nextUrl.searchParams.get("code") ?? "").trim();
  if (!/^ACCT_[A-Za-z0-9]+$/.test(code)) {
    return NextResponse.json({ ok: false, mode, error: "Enter a code that looks like ACCT_xxxxxxxxxx (no spaces)." }, { status: 400 });
  }

  const headers = { Authorization: `Bearer ${secretKey}` };
  try {
    const res = await fetch(`https://api.paystack.co/subaccount/${encodeURIComponent(code)}`, { headers, cache: "no-store" });
    const data = (await res.json().catch(() => null)) as { status?: boolean; message?: string; data?: PaystackSubaccount } | null;
    if (res.ok && data?.status && data.data) {
      return NextResponse.json({ ok: true, mode, subaccount: summary(data.data) });
    }

    // Not found for this key: show what this key can see.
    const listRes = await fetch("https://api.paystack.co/subaccount?perPage=50", { headers, cache: "no-store" });
    const list = (await listRes.json().catch(() => null)) as { data?: PaystackSubaccount[] } | null;
    return NextResponse.json({
      ok: false,
      mode,
      error: data?.message ?? "Paystack doesn't recognise this code.",
      available: (list?.data ?? []).map(summary),
    });
  } catch (err) {
    console.error("[admin/paystack-subaccount] request failed", err);
    return NextResponse.json({ ok: false, mode, error: "Couldn't reach Paystack. Try again." }, { status: 502 });
  }
}
