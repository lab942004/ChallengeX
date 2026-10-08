import { IdeaStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { notFound } from '../../utils/errors';
import { buildMeta, resolvePagination, PageMeta } from '../../utils/pagination';

export const ideaManagementService = {
  async list(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: IdeaStatus;
    userId?: string;
  }) {
    const { page, limit, skip, take } = resolvePagination(query);
    const where = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' as const } },
              { description: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const [total, items] = await Promise.all([
      prisma.idea.count({ where }),
      prisma.idea.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { trials: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);
    return { items, meta: buildMeta(page, limit, total) };
  },

  async get(id: string) {
    const idea = await prisma.idea.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, username: true } },
        trials: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            mode: true,
            status: true,
            verdict: true,
            score: true,
            createdAt: true,
            completedAt: true,
          },
        },
        savedBy: { select: { userId: true } },
      },
    });
    if (!idea) throw notFound('Idea not found.');
    return idea;
  },
};
