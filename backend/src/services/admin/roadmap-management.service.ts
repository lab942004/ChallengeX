import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { notFound } from '../../utils/errors';
import { buildMeta, resolvePagination, PageMeta } from '../../utils/pagination';

export const roadmapManagementService = {
  async list(query: { page?: number; limit?: number; active?: boolean }) {
    const { page, limit, skip, take } = resolvePagination(query);
    const where = query.active !== undefined ? { active: query.active } : {};
    const [total, items] = await Promise.all([
      prisma.roadmapTemplate.count({ where }),
      prisma.roadmapTemplate.findMany({ where, orderBy: { order: 'asc' }, skip, take }),
    ]);
    return {
      items: items.map((t) => ({
        ...t,
        tasks: (t.tasks as string[]) ?? [],
        deliverables: (t.deliverables as string[]) ?? [],
      })),
      meta: buildMeta(page, limit, total),
    };
  },

  async create(data: {
    name: string;
    description?: string;
    order?: number;
    objective: string;
    tasks: string[];
    deliverables: string[];
    estimatedEffort?: string;
    active?: boolean;
  }) {
    return prisma.roadmapTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        order: data.order ?? 0,
        objective: data.objective,
        tasks: data.tasks as unknown as Prisma.InputJsonValue,
        deliverables: data.deliverables as unknown as Prisma.InputJsonValue,
        estimatedEffort: data.estimatedEffort ?? '1 week',
        active: data.active ?? true,
      },
    });
  },

  async update(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      order: number;
      objective: string;
      tasks: string[];
      deliverables: string[];
      estimatedEffort: string;
      active: boolean;
    }>,
  ) {
    const existing = await prisma.roadmapTemplate.findUnique({ where: { id } });
    if (!existing) throw notFound('Roadmap template not found.');
    return prisma.roadmapTemplate.update({
      where: { id },
      data: {
        ...data,
        ...(data.tasks ? { tasks: data.tasks as unknown as Prisma.InputJsonValue } : {}),
        ...(data.deliverables
          ? { deliverables: data.deliverables as unknown as Prisma.InputJsonValue }
          : {}),
      },
    });
  },

  async remove(id: string): Promise<void> {
    const existing = await prisma.roadmapTemplate.findUnique({ where: { id } });
    if (!existing) throw notFound('Roadmap template not found.');
    await prisma.roadmapTemplate.delete({ where: { id } });
  },
};
