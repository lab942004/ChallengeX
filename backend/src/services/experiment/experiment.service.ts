import { Experiment } from '@prisma/client';
import { prisma } from '../../config/database';
import { notFound } from '../../utils/errors';
import {
  CreateExperimentInput,
  UpdateExperimentInput,
} from '../../validators/experiment.validator';
import { notificationService } from '../notification/notification.service';

async function assertTrialOwned(userId: string, trialId: string) {
  const trial = await prisma.trial.findFirst({
    where: { id: trialId, userId },
    include: { idea: { select: { title: true } } },
  });
  if (!trial) throw notFound('Trial not found.');
  return trial;
}

export const experimentService = {
  async listForTrial(userId: string, trialId: string): Promise<Experiment[]> {
    await assertTrialOwned(userId, trialId);
    return prisma.experiment.findMany({ where: { trialId }, orderBy: { createdAt: 'desc' } });
  },

  async create(userId: string, trialId: string, input: CreateExperimentInput): Promise<Experiment> {
    const trial = await assertTrialOwned(userId, trialId);
    const experiment = await prisma.experiment.create({
      data: {
        trialId,
        title: input.title,
        description: input.description,
        steps: input.steps,
        successMetric: input.successMetric,
        estimatedCost: input.estimatedCost,
        duration: input.duration,
        status: input.status ?? 'PLANNED',
      },
    });
    await notificationService.create(
      userId,
      'EXPERIMENT_CREATED',
      'Experiment created',
      `Validation experiment "${experiment.title}" was created for "${trial.idea.title}".`,
    );
    return experiment;
  },

  async update(userId: string, experimentId: string, input: UpdateExperimentInput): Promise<Experiment> {
    const experiment = await prisma.experiment.findUnique({
      where: { id: experimentId },
      include: { trial: { select: { userId: true } } },
    });
    if (!experiment || experiment.trial.userId !== userId) throw notFound('Experiment not found.');

    return prisma.experiment.update({
      where: { id: experimentId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.steps !== undefined ? { steps: input.steps } : {}),
        ...(input.successMetric !== undefined ? { successMetric: input.successMetric } : {}),
        ...(input.estimatedCost !== undefined ? { estimatedCost: input.estimatedCost } : {}),
        ...(input.duration !== undefined ? { duration: input.duration } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });
  },
};
