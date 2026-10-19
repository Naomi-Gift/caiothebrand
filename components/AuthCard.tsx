import Link from "next/link";

/** Shared shell for login-style pages (matches /login and /signup). */
export default function AuthCard({ subtitle, children }: { subtitle: string; children: React.ReactNode }) {
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
        <div className="rounded-3xl border border-bone/80 bg-crisp/90 p-8 shadow-soft-lg backdrop-blur-sm">
          <div className="mb-6 text-center">
            <Link href="/" className="font-display text-2xl font-bold italic text-brown">
              Caio <span className="text-brown-light">Pizza</span>
            </Link>
            <p className="mt-1 text-xs text-brown-light">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export const authInput =
  "w-full rounded-full bg-cream px-4 py-2.5 text-sm text-brown placeholder:text-brown-light/70 focus:outline-none focus:ring-2 focus:ring-brown/20";
