/** POST /api/promo — check a promo code without shipping the list to browsers. */
import { NextRequest, NextResponse } from "next/server";
import { findPromo } from "@/lib/promo";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { code?: unknown };
  const promo = await findPromo(typeof body.code === "string" ? body.code.slice(0, 40) : null);
  if (!promo) return NextResponse.json({ error: "That code doesn't ring a bell. Try again?" }, { status: 404 });
  return NextResponse.json(promo);
}
