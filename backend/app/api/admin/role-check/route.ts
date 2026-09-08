/**
 * POST /api/admin/role-check
 * Internal endpoint — used by the standalone admin app to verify a user's role.
 * Secured by shared AUTH_SECRET header, not a user session.
 * Body: { email: string }
 * Returns: { role: "ADMIN" | "USER" }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  // Verify shared secret so this can't be called publicly
  const secret = req.headers.get("x-admin-secret");
  const expected = process.env.AUTH_SECRET ?? "";

  // Debug: log first 8 chars to verify secret is loading (remove after fix)
  console.log("AUTH_SECRET prefix:", expected.slice(0, 8));

  if (!secret || secret !== expected) {
    return NextResponse.json({ error: "Forbidden.", hint: expected.slice(0, 8) }, { status: 403 });
  }

  let body: { email?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  if (!body.email) return NextResponse.json({ role: "USER" });

  const user = await prisma.user.findUnique({
    where: { email: body.email },
    select: { role: true },
  });

  return NextResponse.json({ role: user?.role ?? "USER" });
}
