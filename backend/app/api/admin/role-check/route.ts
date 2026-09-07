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
  if (!secret || secret !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
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
