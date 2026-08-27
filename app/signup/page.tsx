"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Button from "@/components/Button";
import GoogleSignInButton from "@/components/GoogleSignInButton";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create the account
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

      const body = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(body.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // 2. Sign in immediately after creation
      const result = await signIn("credentials", {
        email:    email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (!result?.ok || result.error) {
        // Account created but auto sign-in failed — send to login
        router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Could not connect. Check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <p className="label-uppercase text-xs text-brown-light">New here</p>
      <h1 className="mt-2 font-display text-4xl font-bold italic text-brown">
        Create account
      </h1>
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

      <form className="mt-6 flex flex-col gap-3" onSubmit={handleSubmit}>
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

        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

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
