import { z } from 'zod';
import { TrialMode } from '@prisma/client';

export const createTrialSchema = z.object({
  ideaId: z.string().min(1, 'ideaId is required'),
  mode: z.nativeEnum(TrialMode, {
    errorMap: () => ({ message: 'Invalid trial mode' }),
  }),
});

export const saveAnswerSchema = z.object({
  questionId: z.string().min(1, 'questionId is required'),
  answer: z
    .string()
    .trim()
    .min(1, 'An answer is required')
    .max(2000, 'Answer must be at most 2000 characters'),
});

export const listTrialsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ABANDONED']).optional(),
  verdict: z.enum(['BUILD', 'PIVOT', 'VALIDATE', 'KILL']).optional(),
  search: z.string().trim().max(120).optional(),
  sort: z.enum(['createdAt', 'score', 'completedAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export type CreateTrialInput = z.infer<typeof createTrialSchema>;
export type SaveAnswerInput = z.infer<typeof saveAnswerSchema>;
export type ListTrialsQuery = z.infer<typeof listTrialsQuerySchema>;
