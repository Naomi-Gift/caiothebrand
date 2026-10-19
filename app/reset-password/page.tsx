"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Button from "@/components/Button";
import AuthCard, { authInput } from "@/components/AuthCard";

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords don't match.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { email?: string; error?: string };
      if (!res.ok || !data.email) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      // Sign straight in with the new password; admins land on /admin.
      const result = await signIn("credentials", { email: data.email, password, redirect: false });
      router.push(result?.ok ? "/auth/redirect" : "/login?reset=1");
      router.refresh();
    } catch {
      setError("Could not connect. Check your connection and try again.");
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthCard subtitle="Reset password">
        <p className="text-sm text-brown">This reset link is incomplete. Please request a new one.</p>
        <Button href="/forgot-password" className="mt-6 w-full">Request a new link</Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard subtitle="Choose a new password">
      <h1 className="font-display text-3xl font-bold italic text-brown">New password</h1>
      <p className="mt-1 text-sm text-brown-light">At least 8 characters.</p>
      <form className="mt-6 flex flex-col gap-3" onSubmit={submit}>
        <label htmlFor="rp-pass" className="sr-only">New password</label>
        <input id="rp-pass" type={show ? "text" : "password"} required autoComplete="new-password" value={password}
          onChange={(e) => { setPassword(e.target.value); setError(null); }}
          placeholder="New password" className={authInput} />
        <label htmlFor="rp-confirm" className="sr-only">Confirm new password</label>
        <input id="rp-confirm" type={show ? "text" : "password"} required autoComplete="new-password" value={confirm}
          onChange={(e) => { setConfirm(e.target.value); setError(null); }}
          placeholder="Confirm new password" className={authInput} />
        <label className="flex items-center gap-2 px-1 text-xs text-brown-light">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="accent-[#3a2418]" />
          Show passwords
        </label>
        {error && (
          <p role="alert" className="rounded-xl bg-bone/60 px-4 py-2 text-xs text-brown">
            {error}{" "}
            {error.includes("expired") && <Link href="/forgot-password" className="font-semibold underline">Get a new link</Link>}
          </p>
        )}
        <Button type="submit" disabled={loading} className="mt-2">{loading ? "Saving…" : "Save and log in"}</Button>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={null}><ResetForm /></Suspense>;
}
