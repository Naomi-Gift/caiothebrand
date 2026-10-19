/**
 * Admin access checks.
 *
 * Two kinds of admin:
 *   - full admin    (role ADMIN, no branchId): everything, all branches
 *   - branch manager (role ADMIN + branchId): only their branch's orders,
 *     feedback and analytics; no menu, settings or user management
 *
 * Pass { fullAdmin: true } for anything a branch manager mustn't touch.
 */
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { branches } from "@/lib/data/branches";
import type { BranchId } from "@/lib/types";

export interface AdminUser {
  userId: string;
  email: string;
  /** Set for branch managers; null for full admins. */
  branchId: BranchId | null;
}

async function loadAdmin(): Promise<AdminUser | "signed-out" | "not-admin"> {
  const session = await auth();
  if (!session?.user?.email) return "signed-out";
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true, branchId: true },
  });
  if (!user || user.role !== "ADMIN") return "not-admin";
  const branchId = user.branchId && user.branchId in branches ? (user.branchId as BranchId) : null;
  return { userId: user.id, email: session.user.email, branchId };
}

/** API routes: returns the admin, or a ready 401/403 response. */
export async function requireAdmin(opts: { fullAdmin?: boolean } = {}): Promise<
  | ({ ok: true } & AdminUser)
  | { ok: false; response: NextResponse }
> {
  const admin = await loadAdmin();
  if (admin === "signed-out") {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }
  if (admin === "not-admin" || (opts.fullAdmin && admin.branchId)) {
    return { ok: false, response: NextResponse.json({ error: "Forbidden." }, { status: 403 }) };
  }
  return { ok: true, ...admin };
}

/**
 * Server-component guard for admin pages. Runs before any data query:
 * signed out → /admin/login, not an admin → /403, branch manager on a
 * full-admin page → back to /admin.
 */
export async function requireAdminPage(opts: { fullAdmin?: boolean } = {}): Promise<AdminUser> {
  const admin = await loadAdmin();
  if (admin === "signed-out") redirect("/admin/login");
  if (admin === "not-admin") redirect("/403");
  if (opts.fullAdmin && admin.branchId) redirect("/admin");
  return admin;
}

/**
 * Which branch an admin view should show: a manager always gets their own;
 * a full admin gets the ?branch= they picked, or all (null).
 */
export function scopedBranch(admin: AdminUser, requested?: string | null): BranchId | null {
  if (admin.branchId) return admin.branchId;
  return requested && requested in branches ? (requested as BranchId) : null;
}

/** May this admin act on an order/feedback from this branch? */
export function canSeeBranch(admin: AdminUser, branchId: string | null | undefined): boolean {
  return !admin.branchId || admin.branchId === branchId;
}
