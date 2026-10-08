import { Roadmap, RoadmapStep, StepStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { notFound } from '../../utils/errors';
import { UpdateRoadmapStepInput } from '../../validators/roadmap.validator';
import { notificationService } from '../notification/notification.service';

export interface RoadmapDetail extends Roadmap {
  steps: (RoadmapStep & { tasks: string[]; deliverables: string[] })[];
  trialId: string;
}

export const roadmapService = {
  async getForTrial(userId: string, trialId: string): Promise<RoadmapDetail | null> {
    const trial = await prisma.trial.findFirst({ where: { id: trialId, userId } });
    if (!trial) throw notFound('Trial not found.');

    const roadmap = await prisma.roadmap.findUnique({
      where: { trialId },
      include: { steps: { orderBy: { order: 'asc' } } },
    });
    if (!roadmap) return null;

    return {
      ...roadmap,
      steps: roadmap.steps.map((s) => ({
        ...s,
        tasks: (s.tasks as string[]) ?? [],
        deliverables: (s.deliverables as string[]) ?? [],
      })),
    };
  },

  /**
   * Updates a roadmap step status. Progress is persisted in PostgreSQL
   * and the roadmap emits a notification when fully completed.
   */
  async updateStep(
    userId: string,
    roadmapId: string,
    stepId: string,
    input: UpdateRoadmapStepInput,
  ): Promise<RoadmapDetail> {
    const roadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
      include: { trial: { select: { userId: true, id: true, idea: { select: { title: true } } } } },
    });
    if (!roadmap || roadmap.trial.userId !== userId) throw notFound('Roadmap not found.');

    const step = await prisma.roadmapStep.findFirst({ where: { id: stepId, roadmapId } });
    if (!step) throw notFound('Roadmap step not found.');

    await prisma.roadmapStep.update({
      where: { id: stepId },
      data: { status: input.status as StepStatus },
    });

    const remaining = await prisma.roadmapStep.count({
      where: { roadmapId, status: { not: 'COMPLETED' } },
    });

    if (remaining === 0) {
      await prisma.roadmap.update({ where: { id: roadmapId }, data: { status: 'COMPLETED' } });
      await notificationService.create(
        userId,
        'ROADMAP_COMPLETED',
        'Roadmap completed',
        `Every stage of "${roadmap.trial.idea.title}" has been marked complete.`,
      );
    } else if (roadmap.status === 'PENDING') {
      await prisma.roadmap.update({ where: { id: roadmapId }, data: { status: 'IN_PROGRESS' } });
    }

    const detail = await this.getForTrial(userId, roadmap.trialId);
    if (!detail) throw notFound('Roadmap not found.');
    return detail;
  },
};
