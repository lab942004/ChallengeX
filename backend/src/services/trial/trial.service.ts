import { Prisma, Trial } from '@prisma/client';
import { prisma } from '../../config/database';
import { CreateTrialInput, ListTrialsQuery, SaveAnswerInput } from '../../validators/trial.validator';
import { badRequest, notFound } from '../../utils/errors';
import { buildMeta, resolvePagination, PageMeta } from '../../utils/pagination';
import { getAIService } from '../ai';
import { verdictService } from '../verdict/verdict.service';
import { notificationService } from '../notification/notification.service';

export interface TrialListItem extends Trial {
  ideaTitle: string;
  answeredCount: number;
  questionCount: number;
}

export interface TrialDetail extends Trial {
  idea: { id: string; title: string; description: string };
  questions: Array<{
    id: string;
    category: string;
    question: string;
    order: number;
    riskLevel: string;
    explanation: string | null;
    answer: string | null;
  }>;
}

const trialDetailInclude = {
  idea: { select: { id: true, title: true, description: true } },
  questions: {
    orderBy: { order: 'asc' as const },
    include: { answers: { take: 1 } },
  },
} satisfies Prisma.TrialInclude;

export const trialService = {
  /** Creates a trial for an idea and generates its questions via the AI service. */
  async create(userId: string, input: CreateTrialInput): Promise<Trial> {
    const idea = await prisma.idea.findFirst({
      where: { id: input.ideaId, userId, status: { not: 'DELETED' } },
    });
    if (!idea) throw notFound('Idea not found.');

    const active = await prisma.trial.findFirst({
      where: { ideaId: idea.id, userId, status: 'ACTIVE' },
    });
    if (active) return active; // resume instead of duplicating

    const ai = getAIService();
    const questions = await ai.generateQuestions({
      ideaText: `${idea.title}. ${idea.description}`,
      mode: input.mode,
      count: 7,
    });

    const trial = await prisma.trial.create({
      data: {
        userId,
        ideaId: idea.id,
        mode: input.mode,
        questions: {
          create: questions.map((q) => ({
            category: q.category,
            question: q.question,
            order: q.order,
            riskLevel: q.riskLevel,
            explanation: q.explanation,
          })),
        },
      },
      include: { questions: true },
    });

    return trial;
  },

  async list(
    userId: string,
    query: ListTrialsQuery,
  ): Promise<{ items: TrialListItem[]; meta: PageMeta }> {
    const { page, limit, skip, take } = resolvePagination(query);
    const where: Prisma.TrialWhereInput = {
      userId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.verdict ? { verdict: query.verdict } : {}),
      ...(query.search
        ? { idea: { title: { contains: query.search, mode: 'insensitive' } } }
        : {}),
    };

    const sortField = query.sort ?? 'createdAt';
    const sortOrder = query.order === 'asc' ? Prisma.SortOrder.asc : Prisma.SortOrder.desc;

    const [total, trials] = await Promise.all([
      prisma.trial.count({ where }),
      prisma.trial.findMany({
        where,
        include: {
          idea: { select: { title: true } },
          questions: { select: { id: true } },
          answers: { select: { id: true } },
        },
        orderBy: sortField === 'createdAt' ? { createdAt: sortOrder } : { [sortField]: sortOrder },
        skip,
        take,
      }),
    ]);

    const items: TrialListItem[] = trials.map((t) => ({
      ...t,
      ideaTitle: t.idea.title,
      answeredCount: t.answers.length,
      questionCount: t.questions.length,
    }));

    return { items, meta: buildMeta(page, limit, total) };
  },

  async getDetail(userId: string, trialId: string): Promise<TrialDetail> {
    const trial = await prisma.trial.findFirst({
      where: { id: trialId, userId },
      include: trialDetailInclude,
    });
    if (!trial) throw notFound('Trial not found.');

    const { questions, idea, ...rest } = trial;
    return {
      ...rest,
      idea,
      questions: questions.map((q) => ({
        id: q.id,
        category: q.category,
        question: q.question,
        order: q.order,
        riskLevel: q.riskLevel,
        explanation: q.explanation,
        answer: q.answers[0]?.answer ?? null,
      })),
    };
  },

  /**
   * Saves one answer (auto-save) and advances the cursor.
   * Answers survive refresh and the trial is fully resumable.
   */
  async saveAnswer(userId: string, trialId: string, input: SaveAnswerInput) {
    const trial = await prisma.trial.findFirst({ where: { id: trialId, userId } });
    if (!trial) throw notFound('Trial not found.');
    if (trial.status === 'COMPLETED') throw badRequest('This trial is already completed.');

    const question = await prisma.trialQuestion.findFirst({
      where: { id: input.questionId, trialId },
    });
    if (!question) throw notFound('Question not found for this trial.');

    await prisma.trialAnswer.upsert({
      where: { trialId_questionId: { trialId, questionId: input.questionId } },
      create: { trialId, questionId: input.questionId, answer: input.answer },
      update: { answer: input.answer },
    });

    const [answeredCount, totalQuestions] = await Promise.all([
      prisma.trialAnswer.count({ where: { trialId } }),
      prisma.trialQuestion.count({ where: { trialId } }),
    ]);

    const allAnswered = answeredCount >= totalQuestions;
    const nextOrder = question.order + 1;
    const nextQuestion = allAnswered
      ? null
      : await prisma.trialQuestion.findFirst({
          where: { trialId, order: { gte: nextOrder }, answers: { none: {} } },
          orderBy: { order: 'asc' },
        });

    const updated = await prisma.trial.update({
      where: { id: trialId },
      data: { currentQuestion: nextQuestion?.order ?? trial.currentQuestion },
    });

    return {
      trial: updated,
      answeredCount,
      totalQuestions,
      allAnswered,
    };
  },
};
