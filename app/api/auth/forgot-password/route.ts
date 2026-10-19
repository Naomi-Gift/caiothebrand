/**
 * POST /api/auth/forgot-password { email }
 * Emails a one-time reset link. The reply is the same whether or not the
 * email has an account, so this can't be used to discover who's registered.
 */
import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emailConfigured, resetPasswordEmail, sendEmail, siteUrl } from "@/lib/email";

const SENT = {
  ok: true,
  message: "If there's an account for that email, we've sent a link to reset the password. Check your inbox (and spam).",
};
const MAX_PER_HOUR = 3;

const hashToken = (t: string) => crypto.createHash("sha256").update(t).digest("hex");

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { email?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 200) : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!emailConfigured() && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Password reset by email isn't switched on yet. Please contact the branch and we'll help you get back in." },
      { status: 503 }
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true } });
    if (!user) return NextResponse.json(SENT);

    const recent = await prisma.passwordResetToken.count({
      where: { userId: user.id, createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) } },
    });
    if (recent >= MAX_PER_HOUR) return NextResponse.json(SENT); // quietly rate-limited

    const token = crypto.randomBytes(32).toString("base64url");
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    const link = `${siteUrl()}/reset-password?token=${token}`;

    if (!emailConfigured()) {
      // Local development only (production returns 503 above).
      console.info("[forgot-password] email not configured — reset link:", link);
    } else {
      const mail = resetPasswordEmail(user.name, link);
      await sendEmail({ to: email, ...mail });
    }
    return NextResponse.json(SENT);
  } catch (err) {
    console.error("[forgot-password] failed", err);
    return NextResponse.json({ error: "Something went wrong — please try again in a moment." }, { status: 503 });
  }
}
