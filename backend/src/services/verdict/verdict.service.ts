import { Prisma, Verdict } from '@prisma/client';
import { prisma } from '../../config/database';
import { notFound } from '../../utils/errors';
import { getAIService } from '../ai';
import { AnswerForAnalysis, VerdictResult } from '../ai/ai.service';
import { notificationService } from '../notification/notification.service';

export interface VerdictPayload {
  trialId: string;
  ideaTitle: string;
  score: number;
  verdict: Verdict;
  summary: string;
  breakdown: { category: string; score: number }[];
  assumptions: {
    id: string;
    title: string;
    description: string;
    risk: string;
    evidence: string;
    validationMethod: string;
  }[];
  risks: { id: string; title: string; description: string; severity: string; evidence: string }[];
  recommendations: { id: string; title: string; description: string; priority: string }[];
  alternativeDirections: { title: string; description: string }[];
  experiment: {
    id: string;
    title: string;
    description: string;
    steps: string[];
    successMetric: string;
    estimatedCost: string;
    duration: string;
    status: string;
  } | null;
  completedAt: string | null;
}

interface AnalysisSnapshot extends VerdictResult {
  alternativeDirections: { title: string; description: string }[];
}

function parseSnapshot(value: Prisma.JsonValue | null): AnalysisSnapshot | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  if (typeof v.score !== 'number' || typeof v.verdict !== 'string') return null;
  return {
    score: v.score,
    verdict: v.verdict as Verdict,
    summary: typeof v.summary === 'string' ? v.summary : '',
    breakdown: Array.isArray(v.breakdown) ? (v.breakdown as VerdictResult['breakdown']) : [],
    alternativeDirections: Array.isArray(v.alternativeDirections)
      ? (v.alternativeDirections as AnalysisSnapshot['alternativeDirections'])
      : [],
  };
}

export const verdictService = {
  /**
   * Completes a trial: runs the full backend analysis pipeline
   * (score → verdict → assumptions → risks → recommendations →
   *  alternatives → experiment → roadmap) and persists everything.
   */
  async complete(userId: string, trialId: string): Promise<VerdictPayload> {
    const trial = await prisma.trial.findFirst({
      where: { id: trialId, userId },
      include: {
        idea: true,
        questions: { orderBy: { order: 'asc' }, include: { answers: true } },
      },
    });
    if (!trial) throw notFound('Trial not found.');
    if (trial.status === 'COMPLETED') {
      return this.getVerdict(userId, trialId);
    }

    const answers: AnswerForAnalysis[] = trial.questions
      .map((q) => {
        const a = q.answers[0];
        return a ? { category: q.category, question: q.question, answer: a.answer } : null;
      })
      .filter((x): x is AnswerForAnalysis => x !== null);

    const ai = getAIService();
    const analysis = await ai.analyzeTrial(answers);
    const [
      assumptions,
      risks,
      recommendations,
      alternativeDirections,
      experimentDraft,
      roadmapStages,
    ] = await Promise.all([
      ai.generateAssumptions(answers),
      ai.generateRisks(answers),
      ai.generateRecommendations(answers),
      ai.generateAlternativeDirections(analysis),
      ai.generateExperiment(analysis, `${trial.idea.title}. ${trial.idea.description}`),
      ai.generateRoadmap(analysis, `${trial.idea.title}. ${trial.idea.description}`),
    ]);

    const snapshot: AnalysisSnapshot = { ...analysis, alternativeDirections };

    await prisma.$transaction([
      prisma.trial.update({
        where: { id: trialId },
        data: {
          status: 'COMPLETED',
          score: analysis.score,
          verdict: analysis.verdict,
          analysis: snapshot as unknown as Prisma.InputJsonValue,
          completedAt: new Date(),
        },
      }),
      prisma.assumption.deleteMany({ where: { trialId } }),
      prisma.assumption.createMany({ data: assumptions.map((a) => ({ trialId, ...a })) }),
      prisma.risk.deleteMany({ where: { trialId } }),
      prisma.risk.createMany({ data: risks.map((r) => ({ trialId, ...r })) }),
      prisma.recommendation.deleteMany({ where: { trialId } }),
      prisma.recommendation.createMany({
        data: recommendations.map((r) => ({ trialId, ...r })),
      }),
      prisma.experiment.deleteMany({ where: { trialId } }),
      prisma.experiment.create({
        data: {
          trialId,
          title: experimentDraft.title,
          description: experimentDraft.description,
          steps: experimentDraft.steps,
          successMetric: experimentDraft.successMetric,
          estimatedCost: experimentDraft.estimatedCost,
          duration: experimentDraft.duration,
        },
      }),
      prisma.roadmap.upsert({
        where: { trialId },
        create: {
          trialId,
          title: `Roadmap — ${trial.idea.title}`,
          steps: {
            create: roadmapStages.map((stage, index) => ({
              title: stage.title,
              description: stage.description,
              order: index + 1,
              objective: stage.objective,
              tasks: stage.tasks,
              deliverables: stage.deliverables,
              estimatedEffort: stage.estimatedEffort,
            })),
          },
        },
        update: {},
      }),
    ]);

    await notificationService.create(
      userId,
      'TRIAL_COMPLETED',
      'Trial completed',
      `Your trial for "${trial.idea.title}" has been completed.`,
    );
    await notificationService.create(
      userId,
      'VERDICT_GENERATED',
      `Verdict: ${analysis.verdict}`,
      `Market readiness score: ${analysis.score}/100 for "${trial.idea.title}".`,
    );

    return this.getVerdict(userId, trialId);
  },

  /** Reads the stored verdict — all numbers come from the backend snapshot. */
  async getVerdict(userId: string, trialId: string): Promise<VerdictPayload> {
    const trial = await prisma.trial.findFirst({
      where: { id: trialId, userId },
      include: {
        idea: { select: { title: true } },
        assumptions: true,
        risks: true,
        recommendations: true,
        experiments: { orderBy: { createdAt: 'asc' as const }, take: 1 },
      },
    });
    if (!trial) throw notFound('Trial not found.');

    const experiment = trial.experiments[0] ?? null;
    const snapshot = parseSnapshot(trial.analysis);
    const summary =
      snapshot?.summary ??
      (trial.status !== 'COMPLETED'
        ? 'This trial has not been completed yet. Finish every question to forge a verdict.'
        : 'Analysis snapshot unavailable.');

    return {
      trialId: trial.id,
      ideaTitle: trial.idea.title,
      score: trial.score ?? snapshot?.score ?? 0,
      verdict: trial.verdict ?? snapshot?.verdict ?? 'KILL',
      summary,
      breakdown: snapshot?.breakdown ?? [],
      assumptions: trial.assumptions.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        risk: a.risk,
        evidence: a.evidence,
        validationMethod: a.validationMethod,
      })),
      risks: trial.risks.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        severity: r.severity,
        evidence: r.evidence,
      })),
      recommendations: trial.recommendations.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        priority: r.priority,
      })),
      alternativeDirections: snapshot?.alternativeDirections ?? [],
      experiment: experiment
        ? {
            id: experiment.id,
            title: experiment.title,
            description: experiment.description,
            steps: (experiment.steps as string[]) ?? [],
            successMetric: experiment.successMetric,
            estimatedCost: experiment.estimatedCost,
            duration: experiment.duration,
            status: experiment.status,
          }
        : null,
      completedAt: trial.completedAt?.toISOString() ?? null,
    };
  },
};

