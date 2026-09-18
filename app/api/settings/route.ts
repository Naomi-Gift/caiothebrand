/**
 * GET  /api/settings  — admin: get all settings as { key: value } map
 * POST /api/settings  — admin: upsert one or many settings { key, value }[]
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return adminAuth.response;

  const rows = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return NextResponse.json(map);
}

export async function POST(req: NextRequest) {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return adminAuth.response;

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const pairs = Array.isArray(body) ? body as Array<{ key: string; value: string }> : [body as { key: string; value: string }];

  await Promise.all(
    pairs.map(({ key, value }) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
