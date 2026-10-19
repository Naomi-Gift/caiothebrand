/**
 * POST /api/auth/reset-password { token, password }
 * Sets a new password from a valid, unused, unexpired reset link.
 * Works for Google-only accounts too (it adds a password).
 */
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const hashToken = (t: string) => crypto.createHash("sha256").update(t).digest("hex");
const EXPIRED = "This reset link has expired or was already used. Please request a new one.";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { token?: unknown; password?: unknown };
  const token = typeof body.token === "string" ? body.token.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!token) return NextResponse.json({ error: EXPIRED }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  if (password.length > 200) return NextResponse.json({ error: "That password is too long." }, { status: 400 });

  try {
    const row = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: { select: { id: true, email: true } } },
    });
    if (!row || row.usedAt || row.expiresAt < new Date()) {
      return NextResponse.json({ error: EXPIRED }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: row.userId }, data: { password: hash } }),
      prisma.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
      // Any other outstanding links for this account stop working.
      prisma.passwordResetToken.deleteMany({ where: { userId: row.userId, usedAt: null, id: { not: row.id } } }),
    ]);
    return NextResponse.json({ ok: true, email: row.user.email });
  } catch (err) {
    console.error("[reset-password] failed", err);
    return NextResponse.json({ error: "Something went wrong — please try again in a moment." }, { status: 503 });
  }
}
