/**
 * POST /api/feedback — public: survey responses and contact messages
 * GET  /api/feedback — admin only: newest 500
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { branches } from "@/lib/data/branches";
import { CHANNELS, FIELD_LIMITS, HIGHLIGHTS } from "@/lib/feedback";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HIGHLIGHT_IDS = new Set<string>(HIGHLIGHTS.map((h) => h.id));
const CHANNEL_IDS = new Set<string>(CHANNELS.map((c) => c.id));

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim().slice(0, max);
  return t || null;
}

function bad(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid request body.");
  }

  // Honeypot — pretend it worked.
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const kind = body.kind === "CONTACT" ? "CONTACT" : "SURVEY";
  const name = str(body.name, FIELD_LIMITS.name);
  const email = str(body.email, FIELD_LIMITS.email);
  const phone = str(body.phone, FIELD_LIMITS.phone);
  const message = str(body.message, FIELD_LIMITS.message);
  const page = str(body.page, FIELD_LIMITS.page);
  const orderRef = str(body.orderRef, FIELD_LIMITS.orderRef);
  const branchId =
    typeof body.branchId === "string" && body.branchId in branches ? body.branchId : null;
  const channel =
    typeof body.channel === "string" && CHANNEL_IDS.has(body.channel) ? body.channel : null;
  const highlights = Array.isArray(body.highlights)
    ? [...new Set(body.highlights.filter((h): h is string => typeof h === "string" && HIGHLIGHT_IDS.has(h)))]
    : [];

  if (email && !EMAIL_RE.test(email)) return bad("That email address doesn't look right.");

  let rating: number | null = null;
  let recommend: number | null = null;

  if (kind === "SURVEY") {
    if (!Number.isInteger(body.rating) || (body.rating as number) < 1 || (body.rating as number) > 5) {
      return bad("Please choose a rating from 1 to 5.");
    }
    rating = body.rating as number;
    if (body.recommend !== null && body.recommend !== undefined) {
      if (!Number.isInteger(body.recommend) || (body.recommend as number) < 0 || (body.recommend as number) > 10) {
        return bad("Recommendation must be between 0 and 10.");
      }
      recommend = body.recommend as number;
    }
  } else {
    if (!name) return bad("Please tell us your name.");
    if (!message) return bad("Please write a message.");
    if (!email && !phone) return bad("Please leave an email or phone number so we can reply.");
  }

  try {
    await prisma.feedback.create({
      data: {
        kind,
        rating,
        recommend,
        highlights: kind === "SURVEY" ? highlights : [],
        branchId,
        channel: kind === "SURVEY" ? channel : null,
        message,
        orderRef,
        name,
        email,
        phone,
        page,
      },
    });
  } catch (err) {
    console.error("[api/feedback] create error", err);
    return NextResponse.json(
      { error: "We couldn't save that just now — please try again." },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return adminAuth.response;

  const feedback = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return NextResponse.json(feedback);
}
