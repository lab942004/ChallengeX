import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaClient } from '@prisma/client';

/**
 * Database integration tests.
 * These run only when the PostgreSQL database is reachable and migrated;
 * otherwise each test is skipped so `npm test` stays green in fresh checkouts.
 */
const prisma = new PrismaClient();
let dbAvailable = false;

describe('database integration', () => {
  beforeAll(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbAvailable = true;
    } catch {
      dbAvailable = false;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('has the expected tables', async (ctx) => {
    if (!dbAvailable) return ctx.skip();
    const rows = await prisma.$queryRaw<{ table_name: string }[]>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    const tables = rows.map((r) => r.table_name);
    expect(tables).toContain('User');
    expect(tables).toContain('Idea');
    expect(tables).toContain('Trial');
    expect(tables).toContain('TrialQuestion');
    expect(tables).toContain('TrialAnswer');
    expect(tables).toContain('Roadmap');
    expect(tables).toContain('Notification');
  });

  it('seeded admin roles exist after prisma:seed', async (ctx) => {
    if (!dbAvailable) return ctx.skip();
    const superAdmin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    expect(superAdmin).toBeTruthy();
    expect(admin).toBeTruthy();
  });

  it('seeded challenge categories exist', async (ctx) => {
    if (!dbAvailable) return ctx.skip();
    const count = await prisma.challengeCategory.count();
    expect(count).toBeGreaterThanOrEqual(7);
  });
});
