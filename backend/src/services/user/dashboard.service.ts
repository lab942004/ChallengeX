import { prisma } from '../../config/database';

export interface DashboardStats {
  totalIdeas: number;
  totalTrials: number;
  buildDecisions: number;
  pivotDecisions: number;
  validateDecisions: number;
  killedIdeas: number;
  averageScore: number;
  unreadNotifications: number;
  activeTrial: { id: string; ideaTitle: string; currentQuestion: number; totalQuestions: number } | null;
  recentTrials: {
    id: string;
    ideaTitle: string;
    verdict: string | null;
    score: number | null;
    status: string;
    createdAt: string;
  }[];
  savedIdeas: { id: string; title: string; savedAt: string }[];
  roadmapCount: number;
  experimentCount: number;
}

/** All dashboard numbers are computed HERE, on the backend. */
export const dashboardService = {
  async getStats(userId: string): Promise<DashboardStats> {
    const [
      totalIdeas,
      totalTrials,
      buildDecisions,
      pivotDecisions,
      validateDecisions,
      killedIdeas,
      scoredTrials,
      unreadNotifications,
      activeTrial,
      recentTrials,
      savedIdeas,
      roadmapCount,
      experimentCount,
    ] = await Promise.all([
      prisma.idea.count({ where: { userId, status: { not: 'DELETED' } } }),
      prisma.trial.count({ where: { userId } }),
      prisma.trial.count({ where: { userId, verdict: 'BUILD' } }),
      prisma.trial.count({ where: { userId, verdict: 'PIVOT' } }),
      prisma.trial.count({ where: { userId, verdict: 'VALIDATE' } }),
      prisma.trial.count({ where: { userId, verdict: 'KILL' } }),
      prisma.trial.findMany({
        where: { userId, score: { not: null } },
        select: { score: true },
      }),
      prisma.notification.count({ where: { userId, read: false } }),
      prisma.trial.findFirst({
        where: { userId, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        include: {
          idea: { select: { title: true } },
          questions: { select: { id: true } },
          answers: { select: { id: true } },
        },
      }),
      prisma.trial.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { idea: { select: { title: true } } },
      }),
      prisma.savedIdea.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { idea: { select: { id: true, title: true } } },
      }),
      prisma.roadmap.count({ where: { trial: { userId } } }),
      prisma.experiment.count({ where: { trial: { userId } } }),
    ]);

    const averageScore =
      scoredTrials.length === 0
        ? 0
        : Math.round(
            scoredTrials.reduce((sum, t) => sum + (t.score ?? 0), 0) / scoredTrials.length,
          );

    return {
      totalIdeas,
      totalTrials,
      buildDecisions,
      pivotDecisions,
      validateDecisions,
      killedIdeas,
      averageScore,
      unreadNotifications,
      activeTrial: activeTrial
        ? {
            id: activeTrial.id,
            ideaTitle: activeTrial.idea.title,
            currentQuestion: activeTrial.currentQuestion,
            totalQuestions: activeTrial.questions.length,
          }
        : null,
      recentTrials: recentTrials.map((t) => ({
        id: t.id,
        ideaTitle: t.idea.title,
        verdict: t.verdict,
        score: t.score,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
      })),
      savedIdeas: savedIdeas.map((s) => ({
        id: s.idea.id,
        title: s.idea.title,
        savedAt: s.createdAt.toISOString(),
      })),
      roadmapCount,
      experimentCount,
    };
  },
};
