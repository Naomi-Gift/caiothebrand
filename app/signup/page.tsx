"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Button from "@/components/Button";
import GoogleSignInButton from "@/components/GoogleSignInButton";

type Step = "details" | "confirm";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";

  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password) return;

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setStep("confirm");
  };

  const handleConfirm = async () => {
    setError(null);
    setLoading(true);

    // 1. Create the account via the backend register endpoint
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:     name.trim(),
        email:    email.trim().toLowerCase(),
        password,
        phone:    phone.trim() || undefined,
      }),
    });

    if (!res.ok) {
      const body = (await res.json()) as { error?: string };
      setError(body.error ?? "Something went wrong. Try again.");
      setLoading(false);
      setStep("details");
      return;
    }

    // 2. Immediately sign in with the new credentials
    const result = await signIn("credentials", {
      email:    email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (!result?.ok || result.error) {
      // Account created but sign-in failed — send to login
      router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <p className="label-uppercase text-xs text-brown-light">New here</p>
      <h1 className="mt-2 font-display text-4xl font-bold italic text-brown">
        Create account
      </h1>

      {step === "details" && (
        <>
          <p className="mt-3 text-sm text-brown-light">
            Sign up with Google or fill in your details below.
          </p>

          <div className="mt-8 w-full">
            <GoogleSignInButton callbackUrl={redirectTo} />
          </div>

          <div className="mt-6 flex items-center gap-3 text-xs text-brown-light">
            <span className="h-px flex-1 bg-bone" />
            or
            <span className="h-px flex-1 bg-bone" />
          </div>

          <form className="mt-6 flex flex-col gap-3" onSubmit={handleDetailsSubmit}>
            <input
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="rounded-full bg-cream px-4 py-2.5 text-sm text-brown placeholder:text-brown-light focus:outline-none focus:ring-2 focus:ring-brown/20"
            />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              placeholder="Email address"
              className="rounded-full bg-cream px-4 py-2.5 text-sm text-brown placeholder:text-brown-light focus:outline-none focus:ring-2 focus:ring-brown/20"
            />
            <input
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number (optional)"
              className="rounded-full bg-cream px-4 py-2.5 text-sm text-brown placeholder:text-brown-light focus:outline-none focus:ring-2 focus:ring-brown/20"
            />
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              placeholder="Password (min. 8 characters)"
              className="rounded-full bg-cream px-4 py-2.5 text-sm text-brown placeholder:text-brown-light focus:outline-none focus:ring-2 focus:ring-brown/20"
            />
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
              placeholder="Confirm password"
              className="rounded-full bg-cream px-4 py-2.5 text-sm text-brown placeholder:text-brown-light focus:outline-none focus:ring-2 focus:ring-brown/20"
            />

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-2 text-xs text-red-600">
                {error}
              </p>
            )}

            <Button type="submit" className="mt-2">
              Continue
            </Button>
          </form>
        </>
      )}

      {step === "confirm" && (
        <>
          <p className="mt-3 text-sm text-brown-light">
            Check your details before we create your account.
          </p>

          <div className="mt-8 flex flex-col gap-3 rounded-2xl bg-cream p-5">
            <div>
              <p className="label-uppercase text-[0.65rem] text-brown-light">Name</p>
              <p className="mt-1 text-sm text-brown">{name}</p>
            </div>
            <div>
              <p className="label-uppercase text-[0.65rem] text-brown-light">Email</p>
              <p className="mt-1 text-sm text-brown">{email}</p>
            </div>
            {phone && (
              <div>
                <p className="label-uppercase text-[0.65rem] text-brown-light">Phone</p>
                <p className="mt-1 text-sm text-brown">{phone}</p>
              </div>
            )}
            <div>
              <p className="label-uppercase text-[0.65rem] text-brown-light">Password</p>
              <p className="mt-1 text-sm text-brown">{"•".repeat(Math.min(password.length, 12))}</p>
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => setStep("details")}
            >
              Edit
            </Button>
            <Button type="button" disabled={loading} onClick={handleConfirm}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </div>
        </>
      )}

      <p className="mt-6 text-sm text-brown-light">
        Already have an account?{" "}
        <Link
          href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
          className="text-brown underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
