"use client";
import { useState } from "react";

/** Sends a test email to the signed-in admin and shows the email service's answer. */
export default function TestEmailButton() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const send = async () => {
    setBusy(true);
    setResult(null);
    const res = await fetch("/api/admin/test-email", { method: "POST" });
    const d = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; to?: string; from?: string | null };
    setBusy(false);
    setResult(
      d.ok
        ? { ok: true, text: `Sent to ${d.to} from ${d.from}. Check the inbox (and spam).` }
        : { ok: false, text: d.error ?? "Couldn't send." }
    );
  };

  return (
    <div className="rounded-2xl border border-bone-dark/60 bg-crisp p-6 shadow-soft">
      <h2 className="font-display text-xl font-bold text-brown-darkest">Email</h2>
      <p className="mt-1 text-sm text-brown-light">Password-reset emails are sent through Resend. Send yourself a test to check it works.</p>
      <button type="button" onClick={send} disabled={busy}
        className="mt-4 rounded-full border border-bone-dark/70 px-5 py-2 text-sm font-medium text-brown hover:bg-cream disabled:opacity-50">
        {busy ? "Sending…" : "Send test email to me"}
      </button>
      {result && (
        <p className={`mt-3 rounded-xl px-4 py-3 text-sm ${result.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>{result.text}</p>
      )}
    </div>
  );
}
