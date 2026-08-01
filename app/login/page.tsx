"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount } from "@/context/AccountContext";
import Button from "@/components/Button";
import GoogleSignInButton from "@/components/GoogleSignInButton";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";
  const { login } = useAccount();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(email);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(redirectTo);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <p className="label-uppercase text-xs text-brown-light">Welcome back</p>
      <h1 className="mt-2 font-display text-4xl font-black text-brown">
        Log in
      </h1>
      <p className="mt-3 text-sm text-brown-light">
        Enter the email you signed up with to see your addresses and order
        history.
      </p>

      <div className="mt-8">
        <GoogleSignInButton callbackUrl={redirectTo} />
      </div>

      <div className="mt-6 flex items-center gap-3 text-xs text-brown-light">
        <span className="h-px flex-1 bg-bone" />
        or
        <span className="h-px flex-1 bg-bone" />
      </div>

      <form className="mt-6 flex flex-col gap-3" onSubmit={handleSubmit}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          placeholder="Email address"
          className="rounded-full bg-cream px-4 py-2.5 text-sm text-brown placeholder:text-brown-light focus:outline-none"
        />
        {error && <p className="text-sm font-medium text-brown">{error}</p>}
        <Button type="submit" className="mt-2">
          Log in
        </Button>
      </form>

      <p className="mt-6 text-sm text-brown-light">
        New here?{" "}
        <Link
          href={`/signup?redirect=${encodeURIComponent(redirectTo)}`}
          className="text-brown underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
