import { RiskLevel } from '@prisma/client';
import { prisma } from '../../config/database';
import { conflict, notFound } from '../../utils/errors';
import { buildMeta, resolvePagination, PageMeta } from '../../utils/pagination';

export interface QuestionListQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  active?: boolean;
}

export const questionManagementService = {
  async list(query: QuestionListQuery) {
    const { page, limit, skip, take } = resolvePagination(query);
    const where = {
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.active !== undefined ? { active: query.active } : {}),
      ...(query.search
        ? { question: { contains: query.search, mode: 'insensitive' as const } }
        : {}),
    };
    const [total, items] = await Promise.all([
      prisma.challengeQuestion.count({ where }),
      prisma.challengeQuestion.findMany({
        where,
        include: { category: { select: { id: true, name: true } } },
        orderBy: [{ categoryId: 'asc' }, { order: 'asc' }],
        skip,
        take,
      }),
    ]);
    return { items, meta: buildMeta(page, limit, total) };
  },

  async create(data: { categoryId: string; question: string; riskLevel?: RiskLevel; explanation?: string; order?: number }) {
    const category = await prisma.challengeCategory.findUnique({ where: { id: data.categoryId } });
    if (!category) throw notFound('Category not found.');
    return prisma.challengeQuestion.create({
      data: {
        categoryId: data.categoryId,
        question: data.question,
        riskLevel: data.riskLevel ?? 'MEDIUM',
        explanation: data.explanation,
        order: data.order ?? 0,
      },
      include: { category: { select: { id: true, name: true } } },
    });
  },

  async update(id: string, data: Partial<{ categoryId: string; question: string; riskLevel: RiskLevel; explanation: string; order: number; active: boolean }>) {
    const existing = await prisma.challengeQuestion.findUnique({ where: { id } });
    if (!existing) throw notFound('Question not found.');
    return prisma.challengeQuestion.update({
      where: { id },
      data,
      include: { category: { select: { id: true, name: true } } },
    });
  },

  async remove(id: string): Promise<void> {
    const existing = await prisma.challengeQuestion.findUnique({ where: { id } });
    if (!existing) throw notFound('Question not found.');
    await prisma.challengeQuestion.delete({ where: { id } });
  },
};
