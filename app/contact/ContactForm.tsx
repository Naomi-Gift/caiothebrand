"use client";

import { useState } from "react";
import { useBranch } from "@/context/BranchContext";
import { branchList } from "@/lib/data/branches";
import { FIELD_LIMITS } from "@/lib/feedback";

const INPUT =
  "w-full rounded-2xl border border-bone-dark bg-cream px-4 py-3 text-[0.95rem] text-brown-darkest placeholder:text-brown-light focus:border-brown focus:outline-none";
const LABEL = "mb-1.5 block font-heading text-[0.7rem] font-bold uppercase tracking-[0.15em] text-brown";

export default function ContactForm() {
  const { branchId } = useBranch();
  const [pickedBranch, setPickedBranch] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const branchValue = pickedBranch ?? branchId ?? "";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    if (!get("email") && !get("phone")) {
      setError("Please leave an email or phone number so we can reply.");
      return;
    }
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "CONTACT",
          name: get("name"),
          branchId: branchValue || null,
          email: get("email"),
          phone: get("phone"),
          orderRef: get("orderRef"),
          message: get("message"),
          website: get("website"),
          page: window.location.pathname,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong — please try again.");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong — please try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div role="status" className="rounded-2xl bg-cream px-5 py-6">
        <p className="font-display text-2xl font-bold text-brown-darkest">Message sent.</p>
        <p className="mt-1">Thanks — the team will get back to you as soon as they can.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="c-name" className={LABEL}>Name *</label>
        <input id="c-name" name="name" required maxLength={FIELD_LIMITS.name} className={INPUT} autoComplete="name" />
      </div>
      <div>
        <label htmlFor="c-branch" className={LABEL}>Branch</label>
        <select
          id="c-branch"
          value={branchValue}
          onChange={(e) => setPickedBranch(e.target.value)}
          className={INPUT}
        >
          <option value="">Not sure / any</option>
          {branchList.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="c-email" className={LABEL}>Email</label>
        <input id="c-email" name="email" type="email" maxLength={FIELD_LIMITS.email} className={INPUT} autoComplete="email" />
      </div>
      <div>
        <label htmlFor="c-phone" className={LABEL}>Phone</label>
        <input id="c-phone" name="phone" type="tel" maxLength={FIELD_LIMITS.phone} className={INPUT} autoComplete="tel" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="c-ref" className={LABEL}>Order reference</label>
        <input id="c-ref" name="orderRef" maxLength={FIELD_LIMITS.orderRef} className={INPUT} placeholder="Optional" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="c-message" className={LABEL}>Message *</label>
        <textarea id="c-message" name="message" required rows={5} maxLength={FIELD_LIMITS.message} className={INPUT} />
      </div>
      {/* Honeypot — hidden from people, tempting to bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="c-website">Website</label>
        <input id="c-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <p className="text-[0.85rem] text-brown-light sm:col-span-2">Leave an email or phone number so we can reply.</p>
      {error && (
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[0.9rem] text-red-800 sm:col-span-2">
          {error}
        </p>
      )}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={sending}
          className="label-uppercase rounded-full bg-brown px-7 py-3 text-xs text-cream transition-colors hover:bg-brown-deep disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
