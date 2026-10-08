import { prisma } from '../../config/database';

export interface AdminAnalytics {
  totals: {
    users: number;
    admins: number;
    ideas: number;
    trials: number;
    completedTrials: number;
    activeTrials: number;
    experiments: number;
    roadmaps: number;
    notifications: number;
    questions: number;
    categories: number;
    riskRules: number;
    roadmapTemplates: number;
  };
  verdictDistribution: { verdict: string; count: number }[];
  trialsByMode: { mode: string; count: number }[];
  averageScore: number;
  signupsByDay: { date: string; count: number }[];
  recentUsers: { id: string; name: string; email: string; role: string; createdAt: string }[];
}

/** Aggregations are computed on the backend; the admin UI only renders. */
export const analyticsService = {
  async getOverview(): Promise<AdminAnalytics> {
    const day = 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = new Date(Date.now() - 30 * day);

    const [
      users,
      admins,
      ideas,
      trials,
      completedTrials,
      activeTrials,
      experiments,
      roadmaps,
      notifications,
      questions,
      categories,
      riskRules,
      roadmapTemplates,
      verdictGroups,
      modeGroups,
      scoredTrials,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }),
      prisma.idea.count({ where: { status: { not: 'DELETED' } } }),
      prisma.trial.count(),
      prisma.trial.count({ where: { status: 'COMPLETED' } }),
      prisma.trial.count({ where: { status: 'ACTIVE' } }),
      prisma.experiment.count(),
      prisma.roadmap.count(),
      prisma.notification.count(),
      prisma.challengeQuestion.count(),
      prisma.challengeCategory.count(),
      prisma.riskRule.count(),
      prisma.roadmapTemplate.count(),
      prisma.trial.groupBy({ by: ['verdict'], _count: { _all: true }, where: { verdict: { not: null } } }),
      prisma.trial.groupBy({ by: ['mode'], _count: { _all: true } }),
      prisma.trial.findMany({ where: { score: { not: null } }, select: { score: true } }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
    ]);

    // Signups per day for the last 30 days.
    const signupRows = await prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::bigint AS count
      FROM "User"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY 1
      ORDER BY 1 ASC
    `;
    const signupsByDay = signupRows.map((r) => ({
      date: r.day.toISOString().slice(0, 10),
      count: Number(r.count),
    }));

    const averageScore =
      scoredTrials.length === 0
        ? 0
        : Math.round(scoredTrials.reduce((s, t) => s + (t.score ?? 0), 0) / scoredTrials.length);

    return {
      totals: {
        users,
        admins,
        ideas,
        trials,
        completedTrials,
        activeTrials,
        experiments,
        roadmaps,
        notifications,
        questions,
        categories,
        riskRules,
        roadmapTemplates,
      },
      verdictDistribution: verdictGroups.map((g) => ({
        verdict: String(g.verdict),
        count: g._count._all,
      })),
      trialsByMode: modeGroups.map((g) => ({ mode: String(g.mode), count: g._count._all })),
      averageScore,
      signupsByDay,
      recentUsers: recentUsers.map((u) => ({
        ...u,
        role: String(u.role),
        createdAt: u.createdAt.toISOString(),
      })),
    };
  },
};
