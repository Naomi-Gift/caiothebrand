import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

/**
 * Prisma with the node-postgres driver (engine-free client), so no native
 * query-engine binary has to survive bundling on Vercel.
 */
/**
 * Drop Prisma-only query params (node-postgres doesn't understand them).
 * Plain string handling on purpose: passwords with special characters can
 * make `new URL()` throw.
 */
function stripPrismaParams(connectionString: string) {
  const [base, query] = connectionString.split("?");
  if (!query) return connectionString;
  const kept = query
    .split("&")
    .filter((p) => !/^(pgbouncer|connection_limit|sslmode)=/i.test(p));
  return kept.length ? `${base}?${kept.join("&")}` : base;
}

export function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: stripPrismaParams(process.env.DATABASE_URL ?? ""),
    // Supabase's pooler presents its own CA; encrypt without verifying the chain,
    // matching Prisma's previous default (sslmode=prefer).
    ssl: { rejectUnauthorized: false },
  });
  return new PrismaClient({ adapter });
}
