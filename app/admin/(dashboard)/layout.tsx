import type { ReactNode } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Caio Admin — Super Dashboard" };

const NAV = [
  { href: "/admin",            label: "Dashboard",  icon: "⬛" },
  { href: "/admin/orders",     label: "Orders",     icon: "📋" },
  { href: "/admin/menu",       label: "Menu",       icon: "🍕" },
  { href: "/admin/categories", label: "Categories", icon: "📂" },
  { href: "/admin/analytics",  label: "Analytics",  icon: "📊" },
  { href: "/admin/users",      label: "Users",      icon: "👥" },
  { href: "/admin/settings",   label: "Settings",   icon: "⚙️" },
];

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== "ADMIN") redirect("/admin/login");

  return (
    <div className="flex min-h-screen"
      style={{ background: "linear-gradient(160deg, #1a0e08 0%, #281710 100%)" }}
    >
      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className="hidden w-56 shrink-0 flex-col border-r sm:flex"
        style={{ borderColor: "rgba(235,226,207,0.08)", background: "rgba(0,0,0,0.2)" }}
      >
        {/* Brand */}
        <div className="px-5 py-6 border-b" style={{ borderColor: "rgba(235,226,207,0.08)" }}>
          <Link href="/" className="font-display text-xl font-bold italic text-cream">
            Caio <span className="text-bone/50">Pizza</span>
          </Link>
          <div className="mt-1 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            <p className="label-uppercase text-[0.55rem] tracking-widest text-bone/35">
              Super dashboard
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 p-3 flex-1">
          {NAV.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-bone/50 transition-all duration-150 hover:bg-white/5 hover:text-cream"
            >
              <span className="text-base leading-none opacity-60">{icon}</span>
              <span className="label-uppercase text-[0.65rem] tracking-wide">{label}</span>
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t" style={{ borderColor: "rgba(235,226,207,0.08)" }}>
          <p className="text-[0.65rem] text-bone/30 truncate">
            {session.user.name ?? session.user.email}
          </p>
          <p className="label-uppercase mt-0.5 text-[0.55rem] text-bone/20">Admin</p>
          <form action="/api/auth/signout" method="POST" className="mt-3">
            <button
              type="submit"
              className="label-uppercase w-full rounded-full py-1.5 text-[0.62rem] text-bone/40 transition-colors hover:text-cream"
              style={{ border: "1px solid rgba(235,226,207,0.1)" }}
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Mobile top bar ────────────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 sm:hidden"
        style={{ background: "rgba(26,14,8,0.95)", borderBottom: "1px solid rgba(235,226,207,0.08)", backdropFilter: "blur(12px)" }}
      >
        <Link href="/" className="font-display text-lg font-bold italic text-cream">
          Caio <span className="text-bone/50">Admin</span>
        </Link>
        <div className="flex gap-3">
          {NAV.slice(0, 4).map(({ href, label }) => (
            <Link key={href} href={href}
              className="label-uppercase text-[0.58rem] text-bone/40 hover:text-cream">
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto pt-14 sm:pt-0">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
