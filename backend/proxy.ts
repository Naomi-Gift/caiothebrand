import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { NextAuthRequest } from "next-auth";

const allowedOrigin = process.env.FRONTEND_URL ?? "http://localhost:3000";

export const proxy = auth(async (req: NextAuthRequest) => {
  const { pathname } = req.nextUrl;

  // ── CORS for all /api/* ──────────────────────────────────────────────────
  const origin = req.headers.get("origin");
  const allow = origin === allowedOrigin ? origin : allowedOrigin;

  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(allow),
    });
  }

  // ── Admin route guard ────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!req.auth?.user?.email) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email: req.auth.user.email },
        select: { role: true },
      });
      if (!user || user.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // ── Pass through with CORS headers ──────────────────────────────────────
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(corsHeaders(allow))) {
    response.headers.set(key, value);
  }
  return response;
});

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
