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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });
    setLoading(false);
    if (!result?.ok || result.error) {
      setError("Incorrect email or password.");
      return;
    }
    // Fetch the session to check role and redirect accordingly
    const { getSession } = await import("next-auth/react");
    const session = await getSession();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (session?.user as any)?.role;
    if (role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push(redirectTo === "/account" ? "/account" : redirectTo);
    }
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16"
      style={{ background: "linear-gradient(160deg, #faf5ed 0%, #f0e6d6 100%)" }}
    >
      {/* Warm background blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute right-[-6rem] top-[-4rem] h-80 w-80 rounded-full opacity-40"
        style={{ background: "radial-gradient(circle, #ebe2cf, transparent 70%)" }} />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[-4rem] left-[-4rem] h-64 w-64 rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, #d4c4a8, transparent 70%)" }} />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="rounded-3xl border border-bone/80 bg-crisp/90 p-8 shadow-soft-lg backdrop-blur-sm">
          {/* Logo / wordmark */}
          <div className="mb-6 text-center">
            <Link href="/" className="font-display text-2xl font-bold italic text-brown">
              Caio <span className="text-brown-light">Pizza</span>
            </Link>
            <p className="mt-1 text-xs text-brown-light">Welcome back</p>
          </div>

          <h1 className="font-display text-3xl font-bold italic text-brown">Log in</h1>
          <p className="mt-1 text-sm text-brown-light">
            Sign in to your account to order.
          </p>

          <div className="mt-6">
            <GoogleSignInButton callbackUrl={redirectTo} />
          </div>

          <div className="my-5 flex items-center gap-3 text-xs text-brown-light">
            <span className="h-px flex-1 bg-bone" />
            or
            <span className="h-px flex-1 bg-bone" />
          </div>

          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <input
              type="email" required autoComplete="email"
              value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }}
              placeholder="Email address"
              className="w-full rounded-full bg-cream px-4 py-2.5 text-sm text-brown placeholder:text-brown-light/70 focus:outline-none focus:ring-2 focus:ring-brown/20"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} required autoComplete="current-password"
                value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder="Password"
                className="w-full rounded-full bg-cream px-4 py-2.5 pr-11 text-sm text-brown placeholder:text-brown-light/70 focus:outline-none focus:ring-2 focus:ring-brown/20"
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brown-light hover:text-brown"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>

            {error && (
              <p className="rounded-xl bg-bone/60 px-4 py-2 text-xs text-brown">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? "Logging in…" : "Log in"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-brown-light">
            New here?{" "}
            <Link href={`/signup?redirect=${encodeURIComponent(redirectTo)}`}
              className="font-semibold text-brown underline underline-offset-2">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginForm /></Suspense>;
}
