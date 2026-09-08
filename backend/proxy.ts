import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { NextAuthRequest } from "next-auth";

const allowedOrigins = [
  process.env.FRONTEND_URL  ?? "http://localhost:3000",
  process.env.ADMIN_URL     ?? "http://localhost:5000",
];

export const proxy = auth(async (req: NextAuthRequest) => {
  const { pathname } = req.nextUrl;

  const origin = req.headers.get("origin") ?? "";
  const allow  = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  // ── Preflight ─────────────────────────────────────────────────────────────
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders(allow) });
  }

  // ── role-check is public (secured by x-admin-secret header in handler) ───
  if (pathname === "/api/admin/role-check") {
    const response = NextResponse.next();
    for (const [k, v] of Object.entries(corsHeaders(allow))) response.headers.set(k, v);
    return response;
  }

  // ── Admin page guard ──────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!req.auth?.user?.email) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
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

  // ── Pass through with CORS headers ────────────────────────────────────────
  const response = NextResponse.next();
  for (const [k, v] of Object.entries(corsHeaders(allow))) response.headers.set(k, v);
  return response;
});

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin":      origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods":     "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers":     "Content-Type, Authorization, x-admin-secret",
  };
}

export const config = {
  matcher: ["/api/((?!admin/role-check).)*", "/admin/:path*"],
};
