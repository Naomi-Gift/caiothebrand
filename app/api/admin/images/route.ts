/**
 * POST /api/admin/images — full admin: upload a product photo.
 * Body: the image bytes (the admin form resizes/compresses to WebP first),
 * Content-Type: image/webp | image/jpeg | image/png.
 * Returns { id, url } — save url as the menu item's image.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

const MAX_BYTES = 2_500_000;

/** Trust the file's own header, not just the Content-Type it claims. */
function sniff(b: Uint8Array): string | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin({ fullAdmin: true });
  if (!admin.ok) return admin.response;

  const bytes = new Uint8Array(await req.arrayBuffer());
  if (bytes.length === 0) return NextResponse.json({ error: "No image received." }, { status: 400 });
  if (bytes.length > MAX_BYTES) return NextResponse.json({ error: "That image is too large (max 2.5 MB)." }, { status: 413 });
  const contentType = sniff(bytes);
  if (!contentType) return NextResponse.json({ error: "Please upload a JPG, PNG or WebP image." }, { status: 415 });

  const width = Number(req.headers.get("x-image-width")) || null;
  const height = Number(req.headers.get("x-image-height")) || null;
  const img = await prisma.menuImage.create({
    data: { data: Buffer.from(bytes), contentType, width, height },
    select: { id: true },
  });
  return NextResponse.json({ id: img.id, url: `/api/images/${img.id}` }, { status: 201 });
}
