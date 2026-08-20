import type { NextConfig } from "next";
import path from "path";

// Server-only — never exposed to the browser.
// Set this in Vercel → Settings → Environment Variables as API_URL.
// Local dev default: http://localhost:4000
const API_URL = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Proxy auth + payment-verification calls to the standalone backend
  // server-side, so the browser only ever talks to this app's own origin —
  // no CORS, no cross-origin cookie issues.
  async rewrites() {
    return [
      // Register route handled directly by the backend — must be listed
      // BEFORE the wildcard auth rewrite so it isn't swallowed by NextAuth.
      { source: "/api/auth/register", destination: `${API_URL}/api/auth/register` },
      { source: "/api/auth/:path*",   destination: `${API_URL}/api/auth/:path*`   },
      { source: "/api/paystack/:path*", destination: `${API_URL}/api/paystack/:path*` },
    ];
  },
};

export default nextConfig;
