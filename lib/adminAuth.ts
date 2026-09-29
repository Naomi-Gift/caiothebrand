/**
 * Shared admin auth helper for API routes.
 * Returns the session if the caller is an ADMIN, otherwise returns a 401/403 Response.
 */
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

export async function requireAdmin(): Promise<
  | { ok: true; userId: string; email: string }
  | { ok: false; response: NextResponse }
> {
  const session = await auth();
  if (!session?.user?.email) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "ADMIN") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden." }, { status: 403 }),
    };
  }

  return { ok: true, userId: user.id, email: session.user.email };
}

/**
 * Server-component guard for admin pages. Runs before any data query:
 * signed out → /admin/login, signed in without the ADMIN role → /403.
 */
export async function requireAdminPage(): Promise<{ userId: string; email: string }> {
  const session = await auth();
  if (!session?.user?.email) redirect("/admin/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "ADMIN") redirect("/403");

  return { userId: user.id, email: session.user.email };
}
