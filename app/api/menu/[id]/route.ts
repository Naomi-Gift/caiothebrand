/**
 * GET    /api/menu/[id]   — public: single item by id or slug
 * PATCH  /api/menu/[id]   — admin: partial update
 * DELETE /api/menu/[id]   — admin: delete item
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const item = await prisma.menuItem.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: { category: { select: { slug: true, name: true } } },
  });
  if (!item) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const allowedFields = [
    "name", "slug", "descriptor", "description", "basePrice",
    "categoryId", "spicy", "vegetarian", "featured", "soldOut",
    "available", "sizes", "addOns", "image",
  ];

  const data: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body) data[key] = body[key];
  }

  const item = await prisma.menuItem.update({ where: { id }, data });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  await prisma.menuItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
