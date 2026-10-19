/** GET /api/images/<id> — public product photo. Images never change once
 * uploaded (a new upload gets a new id), so browsers/CDN can cache forever. */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-z0-9]{10,40}$/i.test(id)) return new NextResponse("Not found", { status: 404 });
  const img = await prisma.menuImage.findUnique({ where: { id }, select: { data: true, contentType: true } });
  if (!img) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(img.data), {
    headers: {
      "Content-Type": img.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
