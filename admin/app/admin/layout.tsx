import type { ReactNode } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Caio Admin" };

const NAV = [
  { href: "/admin",            label: "Dashboard" },
  { href: "/admin/analytics",  label: "Analytics" },
  { href: "/admin/menu",       label: "Menu" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders",     label: "Orders" },
  { href: "/admin/users",      label: "Users" },
  { href: "/admin/settings",   label: "Settings" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <span className="text-base font-bold text-gray-900">
              Caio <span className="text-amber-700">Admin</span>
            </span>
            <nav className="hidden items-center gap-0.5 md:flex">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="hidden sm:block">{session.user.name ?? session.user.email}</span>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
