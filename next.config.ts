import type { NextConfig } from "next";
import path from "path";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Proxy auth + payment-verification calls to the standalone backend app
  // server-side, so the browser only ever talks to this app's own origin —
  // no CORS, no cross-origin cookie issues. The backend still owns all the
  // actual logic; this just makes the split invisible to the client.
  async rewrites() {
    return [
      { source: "/api/auth/:path*", destination: `${API_URL}/api/auth/:path*` },
      { source: "/api/paystack/:path*", destination: `${API_URL}/api/paystack/:path*` },
    ];
  },
};

export default nextConfig;
