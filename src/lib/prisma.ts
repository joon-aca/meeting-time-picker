import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cache } from "react";
import type { D1Database } from "@cloudflare/workers-types";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function getLocalPrisma() {
  const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}

export function getD1Database(): D1Database | null {
  try {
    return (getCloudflareContext().env as { DB?: D1Database }).DB ?? null;
  } catch {
    return null;
  }
}

export const getPrisma = cache(() => {
  const database = getD1Database();

  if (database) {
    return new PrismaClient({ adapter: new PrismaD1(database) });
  }

  return getLocalPrisma();
});
