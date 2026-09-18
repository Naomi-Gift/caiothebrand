import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";

export const proxy = auth((req: NextAuthRequest) => {
  const { pathname } = req.nextUrl;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const user = req.auth?.user;

    if (!user) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (user as any).role;
    if (role !== "ADMIN") {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("error", "AccessDenied");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};
