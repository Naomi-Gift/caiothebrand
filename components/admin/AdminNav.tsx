"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: string;
}

const isActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

/** Sidebar links (desktop) — highlights the page you're on. */
export function AdminSideNav({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname() ?? "";
  return (
    <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Dashboard">
      {items.map(({ href, label, icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-full px-4 py-2.5 transition-colors ${
              active ? "bg-cream text-brown-darkest" : "text-bone/65 hover:bg-white/5 hover:text-cream"
            }`}
          >
            <span className="w-5 text-center text-base leading-none" aria-hidden="true">{icon}</span>
            <span className="label-uppercase text-[0.68rem]">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Horizontal tabs (phones). */
export function AdminTabNav({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname() ?? "";
  return (
    <nav className="flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Dashboard">
      {items.map(({ href, label }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`label-uppercase shrink-0 rounded-full px-4 py-2 text-[0.62rem] ${
              active ? "bg-cream text-brown-darkest" : "border border-bone/20 text-bone/70"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SignOutButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={`label-uppercase rounded-full border border-bone/20 px-4 py-2 text-[0.62rem] text-bone/70 transition-colors hover:border-bone/50 hover:text-cream ${className}`}
    >
      Sign out
    </button>
  );
}
