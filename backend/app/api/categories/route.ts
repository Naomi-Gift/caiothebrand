/**
 * GET /api/categories  — public: list all categories ordered by display order
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cats = await prisma.category.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(cats);
}
