/**
 * GET  /api/categories        — public: list all categories ordered by display order
 * POST /api/categories        — admin: create a new category
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const cats = await prisma.category.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(cats);
}

export async function POST(req: NextRequest) {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return adminAuth.response;

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const { name, slug, order } = body;
  if (!name || !slug) return NextResponse.json({ error: "name and slug required." }, { status: 400 });

  const existing = await prisma.category.findUnique({ where: { slug: String(slug) } });
  if (existing) return NextResponse.json({ error: "Slug already in use." }, { status: 409 });

  const cat = await prisma.category.create({
    data: { name: String(name), slug: String(slug), order: Number(order ?? 99) },
  });
  return NextResponse.json(cat, { status: 201 });
}
