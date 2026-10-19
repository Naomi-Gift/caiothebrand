/**
 * PATCH /api/admin/users/[id] — full admin: { role: "USER" | "ADMIN" } and/or
 * { branchId: "lagos" | "owerri" | null } (null = full admin, all branches).
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { branches } from "@/lib/data/branches";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const adminAuth = await requireAdmin({ fullAdmin: true });
  if (!adminAuth.ok) return adminAuth.response;

  const { id } = await params;
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const { role } = body;
  const hasRole = role !== undefined;
  const hasBranch = "branchId" in body;
  if (hasRole && role !== "USER" && role !== "ADMIN") {
    return NextResponse.json({ error: "role must be USER or ADMIN." }, { status: 400 });
  }
  const branchId = body.branchId === null || body.branchId === "" ? null : String(body.branchId ?? "");
  if (hasBranch && branchId !== null && !(branchId in branches)) {
    return NextResponse.json({ error: "Unknown branch." }, { status: 400 });
  }
  if (!hasRole && !hasBranch) return NextResponse.json({ error: "Nothing to change." }, { status: 400 });

  // Prevent self-demotion
  const caller = await prisma.user.findUnique({
    where: { email: adminAuth.email },
    select: { id: true },
  });
  if (caller?.id === id && (role === "USER" || (hasBranch && branchId !== null))) {
    return NextResponse.json(
      { error: "You can't remove your own full admin access." },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(hasRole ? { role: role as "USER" | "ADMIN" } : {}),
      // Back to a normal user = no branch either.
      ...(hasBranch ? { branchId } : role === "USER" ? { branchId: null } : {}),
    },
    select: { id: true, name: true, email: true, role: true, branchId: true },
  });
  return NextResponse.json(user);
}
