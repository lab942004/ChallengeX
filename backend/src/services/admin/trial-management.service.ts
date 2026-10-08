import { prisma } from '../../config/database';
import { notFound } from '../../utils/errors';
import { buildMeta, resolvePagination, PageMeta } from '../../utils/pagination';

export const trialManagementService = {
  async list(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    verdict?: string;
  }) {
    const { page, limit, skip, take } = resolvePagination(query);
    const where = {
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.verdict ? { verdict: query.verdict as never } : {}),
      ...(query.search
        ? { idea: { title: { contains: query.search, mode: 'insensitive' as const } } }
        : {}),
    };
    const [total, items] = await Promise.all([
      prisma.trial.count({ where }),
      prisma.trial.findMany({
        where,
        include: {
          idea: { select: { id: true, title: true } },
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { questions: true, answers: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);
    return { items, meta: buildMeta(page, limit, total) };
  },

  async get(id: string) {
    const trial = await prisma.trial.findUnique({
      where: { id },
      include: {
        idea: { select: { id: true, title: true, description: true } },
        user: { select: { id: true, name: true, email: true, username: true } },
        questions: {
          orderBy: { order: 'asc' },
          include: { answers: { take: 1, select: { answer: true } } },
        },
        assumptions: true,
        risks: true,
        recommendations: true,
        experiments: { orderBy: { createdAt: 'asc' as const }, take: 1 },
        roadmap: { include: { steps: { orderBy: { order: 'asc' as const } } } },
      },
    });
    if (!trial) throw notFound('Trial not found.');
    const { experiments, ...rest } = trial;
    return { ...rest, experiment: experiments[0] ?? null };
  },
};

