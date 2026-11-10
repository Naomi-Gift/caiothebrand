"use client";
import { useState } from "react";

interface Sub {
  code: string;
  businessName: string;
  bank: string;
  accountNumber: string;
  accountName: string | null;
  percentageCharge: number | null;
  active: boolean;
}

interface Result {
  ok: boolean;
  mode?: "live" | "test" | "unknown";
  error?: string;
  subaccount?: Sub;
  available?: Sub[];
}

/** Asks Paystack whether the code typed in the box is a real subaccount for the site's key. */
export default function SubaccountCheck({ code, onUse }: { code: string; onUse: (code: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const check = async () => {
    setBusy(true);
    setResult(null);
    const res = await fetch(`/api/admin/paystack-subaccount?code=${encodeURIComponent(code.trim())}`).catch(() => null);
    const d = ((await res?.json().catch(() => null)) ?? { ok: false, error: "Couldn't reach the server." }) as Result;
    setBusy(false);
    setResult(d);
  };

  const s = result?.subaccount;
  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={check} disabled={busy || !code.trim()}
        className="self-start rounded-full border border-bone-dark/70 px-4 py-1.5 text-xs font-medium text-brown hover:bg-cream disabled:opacity-50">
        {busy ? "Checking with Paystack…" : "Check code with Paystack"}
      </button>
      {result && result.ok && s && (
        <div className={`rounded-xl px-4 py-3 text-xs ${s.active ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}>
          <p className="font-semibold">{s.active ? "✓ Valid" : "Found, but inactive in Paystack"} ({result.mode} mode)</p>
          <p className="mt-1">{s.businessName} · {s.bank} {s.accountNumber}{s.accountName ? ` · ${s.accountName}` : ""}</p>
          {s.percentageCharge !== null && (
            <p className="mt-1">Main account keeps {s.percentageCharge}% of each payment; the branch gets the rest.</p>
          )}
        </div>
      )}
      {result && !result.ok && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-700">
          <p className="font-semibold">✗ {result.error}</p>
          {result.mode && result.mode !== "unknown" && (
            <p className="mt-1">The website is using your Paystack <b>{result.mode}</b> key. Subaccounts made in {result.mode === "live" ? "Test" : "Live"} mode won&apos;t work.</p>
          )}
          {result.available && (
            result.available.length ? (
              <div className="mt-2">
                <p>Subaccounts this key can use:</p>
                <ul className="mt-1 flex flex-col gap-1">
                  {result.available.map((a) => (
                    <li key={a.code} className="flex flex-wrap items-center gap-2">
                      <code className="rounded bg-white px-1.5 py-0.5">{a.code}</code>
                      <span>{a.businessName} · {a.bank} {a.accountNumber}</span>
                      <button type="button" onClick={() => { onUse(a.code); setResult(null); }} className="underline">Use this</button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-1">This key has no subaccounts at all — create them in Paystack ({result.mode} mode) under Settings → Subaccounts.</p>
            )
          )}
        </div>
      )}
    </div>
  );
}
