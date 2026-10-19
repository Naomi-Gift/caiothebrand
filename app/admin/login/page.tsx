"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import GoogleSignInButton from "@/components/GoogleSignInButton";

function LoginForm() {
  const searchParams  = useSearchParams();
  const callbackUrl   = searchParams.get("callbackUrl") ?? "/admin";
  const errorParam    = searchParams.get("error");

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn("credentials", { email, password, callbackUrl });
    setLoading(false);
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16"
      style={{ background: "linear-gradient(160deg, #faf5ed 0%, #f0e6d6 100%)" }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute right-[-6rem] top-[-4rem] h-80 w-80 rounded-full opacity-40"
        style={{ background: "radial-gradient(circle, #ebe2cf, transparent 70%)" }} />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[-4rem] left-[-4rem] h-64 w-64 rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, #d4c4a8, transparent 70%)" }} />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <Logo variant="primary" />
          <p className="label-uppercase text-[0.6rem] tracking-[0.25em] text-brown-light">Super dashboard</p>
        </div>

        <div className="rounded-3xl border border-bone/80 bg-crisp/90 p-8 shadow-soft-lg backdrop-blur-sm">
          <h1 className="font-display text-3xl font-bold text-brown-darkest">Sign in</h1>
          <p className="mt-1 text-sm text-brown-light">Admin and branch manager access only.</p>

          {errorParam && (
            <div className="mt-4 rounded-xl bg-bone/60 px-4 py-3 text-sm text-brown">
              {errorParam === "AccessDenied"
                ? "Your account doesn't have admin access."
                : "Sign-in failed. Check your credentials."}
            </div>
          )}

          <div className="mt-6">
            <GoogleSignInButton />
          </div>

          <div className="my-5 flex items-center gap-3 text-xs text-brown-light">
            <span className="h-px flex-1 bg-bone" />
            or
            <span className="h-px flex-1 bg-bone" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email" required value={email} autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full rounded-full bg-cream px-4 py-2.5 text-sm text-brown placeholder:text-brown-light/70 focus:outline-none focus:ring-2 focus:ring-brown/20"
            />
            <input
              type="password" required value={password} autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-full bg-cream px-4 py-2.5 text-sm text-brown placeholder:text-brown-light/70 focus:outline-none focus:ring-2 focus:ring-brown/20"
            />
            <button
              type="submit" disabled={loading}
              className="label-uppercase mt-2 w-full rounded-full bg-brown py-3 text-xs text-cream shadow-soft transition-colors hover:bg-brown-deep disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-brown-light">
          Not an admin?{" "}
          <Link href="/" className="font-semibold text-brown underline underline-offset-2">
            Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return <Suspense fallback={null}><LoginForm /></Suspense>;
}
