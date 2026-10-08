import { Severity } from '@prisma/client';
import { prisma } from '../../config/database';
import { conflict, notFound } from '../../utils/errors';
import { buildMeta, resolvePagination, PageMeta } from '../../utils/pagination';

export const riskManagementService = {
  async list(query: { page?: number; limit?: number; search?: string; active?: boolean }) {
    const { page, limit, skip, take } = resolvePagination(query);
    const where = {
      ...(query.active !== undefined ? { active: query.active } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' as const } },
              { description: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const [total, items] = await Promise.all([
      prisma.riskRule.count({ where }),
      prisma.riskRule.findMany({ where, orderBy: { severity: 'desc' }, skip, take }),
    ]);
    return { items, meta: buildMeta(page, limit, total) };
  },

  async create(data: { name: string; description: string; category?: string; severity?: Severity; threshold?: number; active?: boolean }) {
    const existing = await prisma.riskRule.findUnique({ where: { name: data.name } });
    if (existing) throw conflict('A risk rule with this name already exists.');
    return prisma.riskRule.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        severity: data.severity ?? 'MEDIUM',
        threshold: data.threshold,
        active: data.active ?? true,
      },
    });
  },

  async update(id: string, data: Partial<{ name: string; description: string; category: string; severity: Severity; threshold: number; active: boolean }>) {
    const existing = await prisma.riskRule.findUnique({ where: { id } });
    if (!existing) throw notFound('Risk rule not found.');
    if (data.name && data.name !== existing.name) {
      const clash = await prisma.riskRule.findUnique({ where: { name: data.name } });
      if (clash) throw conflict('A risk rule with this name already exists.');
    }
    return prisma.riskRule.update({ where: { id }, data });
  },

  async remove(id: string): Promise<void> {
    const existing = await prisma.riskRule.findUnique({ where: { id } });
    if (!existing) throw notFound('Risk rule not found.');
    await prisma.riskRule.delete({ where: { id } });
  },
};
