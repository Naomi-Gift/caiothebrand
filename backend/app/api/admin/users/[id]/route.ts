/**
 * PATCH /api/admin/users/[id]  — admin: set role to USER or ADMIN
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return adminAuth.response;

  const { id } = await params;
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const { role } = body;
  if (role !== "USER" && role !== "ADMIN") {
    return NextResponse.json({ error: "role must be USER or ADMIN." }, { status: 400 });
  }

  // Prevent self-demotion
  const caller = await prisma.user.findUnique({
    where: { email: adminAuth.email },
    select: { id: true },
  });
  if (caller?.id === id && role === "USER") {
    return NextResponse.json(
      { error: "You cannot remove your own admin role." },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });
  return NextResponse.json(user);
}
