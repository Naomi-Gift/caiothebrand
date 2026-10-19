import type { ReactNode } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { AdminSideNav, AdminTabNav, SignOutButton, type AdminNavItem } from "@/components/admin/AdminNav";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/adminAuth";
import { branches } from "@/lib/data/branches";

export const metadata = { title: "Caio Admin — Super Dashboard" };

// fullAdmin: hidden from branch managers (they only see their branch's activity).
const ALL_NAV: (AdminNavItem & { fullAdmin: boolean })[] = [
  { href: "/admin",            label: "Dashboard",  icon: "⬛", fullAdmin: false },
  { href: "/admin/orders",     label: "Orders",     icon: "📋", fullAdmin: false },
  { href: "/admin/menu",       label: "Menu",       icon: "🍕", fullAdmin: true },
  { href: "/admin/categories", label: "Categories", icon: "📂", fullAdmin: true },
  { href: "/admin/analytics",  label: "Analytics",  icon: "📊", fullAdmin: false },
  { href: "/admin/feedback",   label: "Feedback",   icon: "💬", fullAdmin: false },
  { href: "/admin/users",      label: "Users",      icon: "👥", fullAdmin: true },
  { href: "/admin/settings",   label: "Settings",   icon: "⚙️", fullAdmin: true },
];

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== "ADMIN") redirect("/admin/login");
  const admin = await requireAdminPage();
  const NAV = ALL_NAV.filter((n) => !n.fullAdmin || !admin.branchId).map(({ href, label, icon }) => ({ href, label, icon }));
  const roleLabel = admin.branchId ? `${branches[admin.branchId].name} manager` : "Admin";

  return (
    <div className="flex min-h-screen bg-cream text-brown-darkest">
      {/* ── Sidebar (like the website footer) ───────────────────────────── */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-brown-darkest sm:flex">
        <div className="px-6 pb-5 pt-7">
          <Logo variant="reversed" className="[&_img]:h-12" />
          <p className="label-uppercase mt-3 text-[0.58rem] tracking-[0.25em] text-bone/45">Super dashboard</p>
        </div>
        <AdminSideNav items={NAV} />
        <div className="px-6 pb-6 pt-4">
          <p className="truncate text-xs text-bone/70">{session.user.name ?? session.user.email}</p>
          <p className="label-uppercase mt-0.5 text-[0.55rem] text-bone/40">{roleLabel}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <SignOutButton />
            <Link href="/" className="label-uppercase rounded-full px-3 py-2 text-[0.62rem] text-bone/55 hover:text-cream">
              View site ↗
            </Link>
          </div>
        </div>
      </aside>

      {/* ── Phones: top bar + tabs ──────────────────────────────────────── */}
      <div className="fixed inset-x-0 top-0 z-40 bg-brown-darkest sm:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo variant="reversed" className="[&_img]:h-9" />
          <div className="flex items-center gap-2">
            <span className="label-uppercase text-[0.55rem] text-bone/50">{roleLabel}</span>
            <SignOutButton className="px-3 py-1.5" />
          </div>
        </div>
        <AdminTabNav items={NAV} />
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="min-w-0 flex-1 pt-28 sm:pt-0">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
