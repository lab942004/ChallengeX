import { prisma } from '../../config/database';
import { conflict, notFound } from '../../utils/errors';

export const categoryManagementService = {
  async list() {
    return prisma.challengeCategory.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { questions: true } } },
    });
  },

  async create(data: { name: string; description?: string; order?: number; active?: boolean }) {
    const existing = await prisma.challengeCategory.findUnique({ where: { name: data.name } });
    if (existing) throw conflict('A category with this name already exists.');
    return prisma.challengeCategory.create({
      data: {
        name: data.name,
        description: data.description,
        order: data.order ?? 0,
        active: data.active ?? true,
      },
    });
  },

  async update(id: string, data: Partial<{ name: string; description: string; order: number; active: boolean }>) {
    const existing = await prisma.challengeCategory.findUnique({ where: { id } });
    if (!existing) throw notFound('Category not found.');
    if (data.name && data.name !== existing.name) {
      const clash = await prisma.challengeCategory.findUnique({ where: { name: data.name } });
      if (clash) throw conflict('A category with this name already exists.');
    }
    return prisma.challengeCategory.update({ where: { id }, data });
  },

  async remove(id: string): Promise<void> {
    const existing = await prisma.challengeCategory.findUnique({ where: { id } });
    if (!existing) throw notFound('Category not found.');
    // Questions cascade with the category.
    await prisma.challengeCategory.delete({ where: { id } });
  },
};
