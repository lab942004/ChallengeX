import { z } from 'zod';

export const updateRoadmapStepSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED'], {
    errorMap: () => ({ message: 'Invalid step status' }),
  }),
});

export type UpdateRoadmapStepInput = z.infer<typeof updateRoadmapStepSchema>;
