"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount } from "@/context/AccountContext";
import Button from "@/components/Button";
import GoogleSignInButton from "@/components/GoogleSignInButton";

type Step = "details" | "confirm";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";
  const { accountExists, signup } = useAccount();
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    if (accountExists(email)) {
      setError("An account with this email already exists — log in instead.");
      return;
    }
    setError(null);
    setStep("confirm");
  };

  const handleConfirm = () => {
    const result = signup(name, email);
    if (!result.ok) {
      setError(result.error);
      setStep("details");
      return;
    }
    router.push(redirectTo);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <p className="label-uppercase text-xs text-brown-light">New here</p>
      <h1 className="mt-2 font-display text-4xl font-black text-brown">
        Sign up
      </h1>

      {step === "details" && (
        <>
          <p className="mt-3 text-sm text-brown-light">
            A quick, no password signup — enough to save addresses and see
            order history.
          </p>

          <div className="mt-8">
            <GoogleSignInButton callbackUrl={redirectTo} />
          </div>

          <div className="mt-6 flex items-center gap-3 text-xs text-brown-light">
            <span className="h-px flex-1 bg-bone" />
            or
            <span className="h-px flex-1 bg-bone" />
          </div>

          <form
            className="mt-6 flex flex-col gap-3"
            onSubmit={handleDetailsSubmit}
          >
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="rounded-full bg-cream px-4 py-2.5 text-sm text-brown placeholder:text-brown-light focus:outline-none"
            />
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
              <p className="label-uppercase text-[0.65rem] text-brown-light">
                Name
              </p>
              <p className="mt-1 text-brown">{name}</p>
            </div>
            <div>
              <p className="label-uppercase text-[0.65rem] text-brown-light">
                Email
              </p>
              <p className="mt-1 text-brown">{email}</p>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("details")}
            >
              Edit
            </Button>
            <Button type="button" onClick={handleConfirm}>
              Create account
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
