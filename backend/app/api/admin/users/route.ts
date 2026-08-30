/**
 * GET   /api/admin/users         — admin: list all users
 * PATCH /api/admin/users/[id]    — admin: promote/demote role
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return adminAuth.response;

  const users = await prisma.user.findMany({
    orderBy: { role: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      _count: { select: { orders: true } },
    },
  });
  return NextResponse.json(users);
}
