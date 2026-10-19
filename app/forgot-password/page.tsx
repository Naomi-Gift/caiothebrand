"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import AuthCard, { authInput } from "@/components/AuthCard";

function ForgotForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      if (!res.ok) setError(data.error ?? "Something went wrong. Please try again.");
      else setSent(data.message ?? "Check your inbox for a reset link.");
    } catch {
      setError("Could not connect. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard subtitle="Forgot your password?">
      <h1 className="font-display text-3xl font-bold italic text-brown">Reset password</h1>
      {sent ? (
        <div className="mt-4">
          <p role="status" className="rounded-xl bg-bone/60 px-4 py-3 text-sm text-brown">{sent}</p>
          <p className="mt-4 text-sm text-brown-light">The link works once and expires in 1 hour.</p>
        </div>
      ) : (
        <>
          <p className="mt-1 text-sm text-brown-light">Enter your email and we&apos;ll send you a link to choose a new one.</p>
          <form className="mt-6 flex flex-col gap-3" onSubmit={submit}>
            <label htmlFor="fp-email" className="sr-only">Email address</label>
            <input id="fp-email" type="email" required autoComplete="email" value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              placeholder="Email address" className={authInput} />
            {error && <p role="alert" className="rounded-xl bg-bone/60 px-4 py-2 text-xs text-brown">{error}</p>}
            <Button type="submit" disabled={loading} className="mt-2">{loading ? "Sending…" : "Send reset link"}</Button>
          </form>
        </>
      )}
      <p className="mt-5 text-center text-sm text-brown-light">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-brown underline underline-offset-2">Log in</Link>
      </p>
    </AuthCard>
  );
}

export default function ForgotPasswordPage() {
  return <Suspense fallback={null}><ForgotForm /></Suspense>;
}
