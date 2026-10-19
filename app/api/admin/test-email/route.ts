/** POST /api/admin/test-email — full admin: send a test email to yourself and
 * see exactly what the email service (Resend) says. */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { sendEmailDetailed } from "@/lib/email";

export async function POST() {
  const admin = await requireAdmin({ fullAdmin: true });
  if (!admin.ok) return admin.response;
  const result = await sendEmailDetailed({
    to: admin.email,
    subject: "Caio Pizza — test email",
    text: "If you can read this, emails from the Caio Pizza website (password resets) are working.",
    html: "<p style=\"font-family:Georgia,serif;font-size:16px;color:#1a0e08\">If you can read this, emails from the Caio Pizza website (password resets) are working.</p>",
  });
  return NextResponse.json({ ...result, to: admin.email, from: process.env.EMAIL_FROM ?? null }, { status: result.ok ? 200 : 502 });
}
