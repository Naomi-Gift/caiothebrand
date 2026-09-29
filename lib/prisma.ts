import type { PrismaClient } from "@/lib/generated/prisma/client";
import { createPrismaClient } from "@/lib/createPrismaClient";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
