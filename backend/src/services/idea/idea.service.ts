import { Idea } from '@prisma/client';
import { prisma } from '../../config/database';
import { CreateIdeaInput, GenerateIdeaInput, UpdateIdeaInput } from '../../validators/idea.validator';
import { notFound } from '../../utils/errors';
import { buildMeta, resolvePagination, PageMeta } from '../../utils/pagination';
import { getAIService } from '../ai';

export interface IdeaListQuery {
  page?: number;
  limit?: number;
  search?: string;
  saved?: boolean;
}

export const ideaService = {
  async create(userId: string, input: CreateIdeaInput): Promise<Idea> {
    return prisma.idea.create({
      data: { userId, title: input.title, description: input.description },
    });
  },

  async list(userId: string, query: IdeaListQuery): Promise<{ items: Idea[]; meta: PageMeta }> {
    const { page, limit, skip, take } = resolvePagination(query);
    const where = {
      userId,
      status: { not: 'DELETED' as const },
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
      prisma.idea.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    ]);
    return { items, meta: buildMeta(page, limit, total) };
  },

  async get(userId: string, ideaId: string): Promise<Idea> {
    const idea = await prisma.idea.findFirst({
      where: { id: ideaId, userId, status: { not: 'DELETED' } },
    });
    if (!idea) throw notFound('Idea not found.');
    return idea;
  },

  async update(userId: string, ideaId: string, input: UpdateIdeaInput): Promise<Idea> {
    await this.get(userId, ideaId);
    return prisma.idea.update({
      where: { id: ideaId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });
  },

  async remove(userId: string, ideaId: string): Promise<void> {
    await this.get(userId, ideaId);
    await prisma.idea.update({ where: { id: ideaId }, data: { status: 'DELETED' } });
  },

  /** Save/unsave an idea to the user's collection. Returns new saved state. */
  async toggleSave(userId: string, ideaId: string): Promise<{ saved: boolean }> {
    await this.get(userId, ideaId);
    const existing = await prisma.savedIdea.findUnique({
      where: { userId_ideaId: { userId, ideaId } },
    });
    if (existing) {
      await prisma.savedIdea.delete({ where: { id: existing.id } });
      return { saved: false };
    }
    await prisma.savedIdea.create({ data: { userId, ideaId } });
    await prisma.notification.create({
      data: {
        userId,
        title: 'Idea saved',
        message: 'An idea was added to your saved collection.',
        type: 'SAVED_IDEA',
      },
    });
    return { saved: true };
  },

  async listSaved(userId: string): Promise<(Idea & { savedAt: Date })[]> {
    const rows = await prisma.savedIdea.findMany({
      where: { userId },
      include: { idea: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({ ...r.idea, savedAt: r.createdAt }));
  },

  /** AI-backed idea generation — all AI calls happen inside the backend. */
  async generate(userId: string, input: GenerateIdeaInput) {
    void userId; // generation is stateless; the caller decides what to persist
    const ai = getAIService();
    return ai.generateIdea({
      interests: input.interests,
      skills: input.skills,
      problemArea: input.problemArea,
      count: input.count,
    });
  },
};
