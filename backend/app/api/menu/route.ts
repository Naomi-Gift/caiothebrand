/**
 * GET  /api/menu          — public: returns all available menu items grouped by category
 * POST /api/menu          — admin only: create a new menu item
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const items = await prisma.menuItem.findMany({
    where: { available: true },
    include: { category: { select: { slug: true, name: true } } },
    orderBy: [{ category: { order: "asc" } }, { name: "asc" }],
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const { name, slug, descriptor, description, basePrice, categoryId,
          spicy, vegetarian, featured, sizes, addOns, image } = body;

  if (!name || !slug || !basePrice || !categoryId) {
    return NextResponse.json({ error: "name, slug, basePrice and categoryId are required." }, { status: 400 });
  }

  const existing = await prisma.menuItem.findUnique({ where: { slug: String(slug) } });
  if (existing) return NextResponse.json({ error: "Slug already in use." }, { status: 409 });

  const item = await prisma.menuItem.create({
    data: {
      name: String(name),
      slug: String(slug),
      descriptor: descriptor ? String(descriptor) : null,
      description: description ? String(description) : null,
      basePrice: Number(basePrice),
      categoryId: String(categoryId),
      spicy: Boolean(spicy),
      vegetarian: Boolean(vegetarian),
      featured: Boolean(featured),
      sizes: (sizes as object) ?? [],
      addOns: (addOns as object) ?? [],
      image: image ? String(image) : null,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
