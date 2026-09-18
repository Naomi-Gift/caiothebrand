import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/auth/register
 * Body: { name, email, password, phone? }
 *
 * Creates a new user with a hashed password.
 * Returns 201 on success, 409 if email already taken, 400 on bad input.
 */
export async function POST(req: NextRequest) {
  let body: { name?: unknown; email?: unknown; password?: unknown; phone?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, password, phone } = body;

  if (
    typeof name     !== "string" || !name.trim() ||
    typeof email    !== "string" || !email.trim() ||
    typeof password !== "string" || password.length < 8
  ) {
    return NextResponse.json(
      { error: "Name, email, and a password of at least 8 characters are required." },
      { status: 400 }
    );
  }

  const normalised = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalised } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists — log in instead." },
      { status: 409 }
    );
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name:     name.trim(),
      email:    normalised,
      password: hashed,
      phone:    typeof phone === "string" && phone.trim() ? phone.trim() : null,
    },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json(user, { status: 201 });
}
