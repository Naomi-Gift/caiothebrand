"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Button from "@/components/Button";
import GoogleSignInButton from "@/components/GoogleSignInButton";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
      <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

function PasswordInput({ value, onChange, placeholder, autoComplete }: {
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string; autoComplete: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"} required autoComplete={autoComplete}
        value={value} onChange={onChange} placeholder={placeholder}
        className="w-full rounded-full bg-cream px-4 py-2.5 pr-11 text-sm text-brown placeholder:text-brown-light/70 focus:outline-none focus:ring-2 focus:ring-brown/20"
      />
      <button type="button" onClick={() => setShow((v) => !v)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-brown-light hover:text-brown"
        aria-label={show ? "Hide" : "Show"}
      >
        <EyeIcon open={show} />
      </button>
    </div>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";

  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone,           setPhone]           = useState("");
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords don't match."); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password, phone: phone.trim() || undefined }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) { setError(body.error ?? "Something went wrong. Please try again."); setLoading(false); return; }
      const result = await signIn("credentials", { email: email.trim().toLowerCase(), password, redirect: false });
      if (!result?.ok || result.error) { router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`); return; }
      // Check role and redirect accordingly
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const role = (session?.user as any)?.role;
      router.push(role === "ADMIN" ? "/admin" : redirectTo);
      router.refresh();
    } catch {
      setError("Could not connect. Check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16"
      style={{ background: "linear-gradient(160deg, #faf5ed 0%, #f0e6d6 100%)" }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute right-[-6rem] top-[-4rem] h-80 w-80 rounded-full opacity-40"
        style={{ background: "radial-gradient(circle, #ebe2cf, transparent 70%)" }} />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[-4rem] left-[-4rem] h-64 w-64 rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, #d4c4a8, transparent 70%)" }} />

      <div className="relative w-full max-w-sm">
        <div className="rounded-3xl border border-bone/80 bg-crisp/90 p-8 shadow-soft-lg backdrop-blur-sm">
          <div className="mb-6 text-center">
            <Link href="/" className="font-display text-2xl font-bold italic text-brown">
              Caio <span className="text-brown-light">Pizza</span>
            </Link>
            <p className="mt-1 text-xs text-brown-light">Create your account</p>
          </div>

          <h1 className="font-display text-3xl font-bold italic text-brown">Sign up</h1>
          <p className="mt-1 text-sm text-brown-light">Join to order faster and track your meals.</p>

          <div className="mt-6">
            <GoogleSignInButton callbackUrl={redirectTo} />
          </div>

          <div className="my-5 flex items-center gap-3 text-xs text-brown-light">
            <span className="h-px flex-1 bg-bone" />or<span className="h-px flex-1 bg-bone" />
          </div>

          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <input type="text" required autoComplete="name" value={name}
              onChange={(e) => setName(e.target.value)} placeholder="Full name"
              className="w-full rounded-full bg-cream px-4 py-2.5 text-sm text-brown placeholder:text-brown-light/70 focus:outline-none focus:ring-2 focus:ring-brown/20"
            />
            <input type="email" required autoComplete="email" value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }} placeholder="Email address"
              className="w-full rounded-full bg-cream px-4 py-2.5 text-sm text-brown placeholder:text-brown-light/70 focus:outline-none focus:ring-2 focus:ring-brown/20"
            />
            <input type="tel" autoComplete="tel" value={phone}
              onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)"
              className="w-full rounded-full bg-cream px-4 py-2.5 text-sm text-brown placeholder:text-brown-light/70 focus:outline-none focus:ring-2 focus:ring-brown/20"
            />
            <PasswordInput value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }}
              placeholder="Password (min. 8 characters)" autoComplete="new-password" />
            <PasswordInput value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
              placeholder="Confirm password" autoComplete="new-password" />

            {error && (
              <p className="rounded-xl bg-bone/60 px-4 py-2 text-xs text-brown">{error}</p>
            )}

            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-brown-light">
            Already have an account?{" "}
            <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
              className="font-semibold text-brown underline underline-offset-2">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return <Suspense fallback={null}><SignupForm /></Suspense>;
}
