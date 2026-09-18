/**
 * PATCH /api/categories/[id]  — admin: rename or reorder a category
 * DELETE /api/categories/[id] — admin: delete (only if no items attached)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return adminAuth.response;

  const { id } = await params;
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if ("name"  in body) data.name  = String(body.name);
  if ("order" in body) data.order = Number(body.order);

  const cat = await prisma.category.update({ where: { id }, data });
  return NextResponse.json(cat);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const adminAuth = await requireAdmin();
  if (!adminAuth.ok) return adminAuth.response;

  const { id } = await params;
  const count = await prisma.menuItem.count({ where: { categoryId: id } });
  if (count > 0) {
    return NextResponse.json(
      { error: `Cannot delete — ${count} menu item${count > 1 ? "s" : ""} still use this category.` },
      { status: 409 }
    );
  }
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
