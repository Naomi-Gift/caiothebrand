import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";

export const proxy = auth((req: NextAuthRequest) => {
  const { pathname } = req.nextUrl;

  // Public routes
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Everything else requires a signed-in ADMIN
  if (!req.auth?.user?.email) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (req.auth.user as any).role;
  if (role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login?error=AccessDenied", req.url));
  }

  return NextResponse.next();
});

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
