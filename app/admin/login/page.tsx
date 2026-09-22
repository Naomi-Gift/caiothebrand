"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{ background: "linear-gradient(160deg, #1a0e08 0%, #281710 60%, #3a2418 100%)" }}
    >
      {/* Warm glow blobs */}
      <div aria-hidden="true"
        className="pointer-events-none absolute right-[-6rem] top-[-4rem] h-96 w-96 rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, #8b6f4f, transparent 70%)" }}
      />
      <div aria-hidden="true"
        className="pointer-events-none absolute bottom-[-4rem] left-[-6rem] h-72 w-72 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #8b6f4f, transparent 70%)" }}
      />

      <div className="relative w-full max-w-sm">
        {/* Top glow line */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <Link href="/" className="font-display text-3xl font-bold italic text-cream">
            Caio <span className="text-bone/60">Pizza</span>
          </Link>
          <p className="label-uppercase text-[0.6rem] tracking-widest text-bone/40">
            Admin panel
          </p>
        </div>

        <div
          className="rounded-3xl p-8 shadow-soft-lg"
          style={{ background: "rgba(255,252,248,0.06)", border: "1px solid rgba(235,226,207,0.12)", backdropFilter: "blur(16px)" }}
        >
          <h1 className="font-display text-2xl font-bold italic text-cream">Sign in</h1>
          <p className="mt-1 text-sm text-bone/50">Admin access only.</p>

          {errorParam && (
            <div className="mt-4 rounded-xl px-4 py-3 text-sm text-bone/70"
              style={{ background: "rgba(235,226,207,0.08)", border: "1px solid rgba(235,226,207,0.15)" }}>
              {errorParam === "AccessDenied"
                ? "Your account doesn't have admin access."
                : "Sign-in failed. Check your credentials."}
            </div>
          )}

          {/* Google */}
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/auth/redirect" })}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-full py-2.5 text-sm font-medium text-bone/70 transition-all hover:text-cream"
            style={{ background: "rgba(235,226,207,0.08)", border: "1px solid rgba(235,226,207,0.15)" }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-bone/30">
            <span className="h-px flex-1" style={{ background: "rgba(235,226,207,0.15)" }} />
            or
            <span className="h-px flex-1" style={{ background: "rgba(235,226,207,0.15)" }} />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full rounded-full px-4 py-2.5 text-sm text-cream placeholder:text-bone/30 focus:outline-none focus:ring-1 focus:ring-bone/30"
              style={{ background: "rgba(235,226,207,0.08)", border: "1px solid rgba(235,226,207,0.15)" }}
            />
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-full px-4 py-2.5 text-sm text-cream placeholder:text-bone/30 focus:outline-none focus:ring-1 focus:ring-bone/30"
              style={{ background: "rgba(235,226,207,0.08)", border: "1px solid rgba(235,226,207,0.15)" }}
            />
            <button
              type="submit" disabled={loading}
              className="mt-1 w-full rounded-full py-2.5 text-sm font-semibold text-cream shadow-brown transition-all hover:-translate-y-0.5 hover:shadow-brown-lg disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #8b6f4f, #6b4f38)" }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-bone/25">
          Not an admin?{" "}
          <Link href="/" className="text-bone/40 underline underline-offset-2 hover:text-bone/60">
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
