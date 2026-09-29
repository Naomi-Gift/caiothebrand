import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Prisma generates into lib/generated/prisma, which Next's tracing misses —
  // ship the query engine with every server function.
  outputFileTracingIncludes: {
    "/**": ["./lib/generated/prisma/*.node"],
  },
};

export default nextConfig;
