// Option 1: Using PostgreSQL adapter (recommended for most setups)
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import PrismaClient from "@prisma/client";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
const { PrismaClient: ActualPrismaClient } = PrismaClient as any;

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof ActualPrismaClient> | undefined;
};

// Create PostgreSQL connection pool
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new ActualPrismaClient({
    adapter, // ✅ Required in Prisma 7
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;