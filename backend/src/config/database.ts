import { PrismaClient } from '@prisma/client';
import { env, isDev } from './env';

/**
 * Central Prisma client. This module is the ONLY place in the whole
 * project that is allowed to talk to PostgreSQL.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isDev ? ['warn', 'error'] : ['error'],
  });

if (isDev) {
  globalForPrisma.prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

export { env };
