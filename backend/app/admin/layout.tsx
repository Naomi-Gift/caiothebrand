import type { ReactNode } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Caio Admin" };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  // Belt-and-suspenders check alongside middleware
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-lg font-bold tracking-tight text-gray-900">
            Caio <span className="text-amber-700">Admin</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink href="/admin">Dashboard</NavLink>
            <NavLink href="/admin/menu">Menu</NavLink>
            <NavLink href="/admin/orders">Orders</NavLink>
            <NavLink href="/admin/users">Users</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>{session.user.name ?? session.user.email}</span>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
    >
      {children}
    </Link>
  );
}
