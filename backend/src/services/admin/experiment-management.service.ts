import { prisma } from '../../config/database';
import { buildMeta, resolvePagination, PageMeta } from '../../utils/pagination';

export const experimentManagementService = {
  async list(query: { page?: number; limit?: number; status?: string; search?: string }) {
    const { page, limit, skip, take } = resolvePagination(query);
    const where = {
      ...(query.status ? { status: query.status as never } : {}),
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
      prisma.experiment.count({ where }),
      prisma.experiment.findMany({
        where,
        include: {
          trial: {
            select: {
              id: true,
              verdict: true,
              score: true,
              idea: { select: { title: true } },
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);
    return { items, meta: buildMeta(page, limit, total) };
  },
};
