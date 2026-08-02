import { NextResponse, type NextRequest } from "next/server";

const allowedOrigin = process.env.FRONTEND_URL ?? "http://localhost:3000";

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allow = origin === allowedOrigin ? origin : allowedOrigin;

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(allow),
    });
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(corsHeaders(allow))) {
    response.headers.set(key, value);
  }
  return response;
}

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export const config = {
  matcher: "/api/:path*",
};
