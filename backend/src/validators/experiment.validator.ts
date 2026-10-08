import { z } from 'zod';

export const createExperimentSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(2000),
  steps: z.array(z.string().trim().min(1)).min(1).max(20),
  successMetric: z.string().trim().min(3).max(400),
  estimatedCost: z.string().trim().min(1).max(120),
  duration: z.string().trim().min(1).max(120),
  status: z.enum(['DRAFT', 'PLANNED', 'RUNNING', 'COMPLETED', 'CANCELLED']).optional(),
});

export const updateExperimentSchema = createExperimentSchema
  .partial()
  .extend({
    status: z.enum(['DRAFT', 'PLANNED', 'RUNNING', 'COMPLETED', 'CANCELLED']).optional(),
  });

export type CreateExperimentInput = z.infer<typeof createExperimentSchema>;
export type UpdateExperimentInput = z.infer<typeof updateExperimentSchema>;
