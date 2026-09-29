"use client";

import { usePathname } from "next/navigation";

/** Renders its children everywhere except the /admin/* dashboard. */
export default function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
