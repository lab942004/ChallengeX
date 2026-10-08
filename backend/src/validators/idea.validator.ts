import { z } from 'zod';

export const createIdeaSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120),
  description: z
    .string()
    .trim()
    .min(10, 'Describe your idea in at least 10 characters')
    .max(500, 'Idea description is limited to 500 characters'),
});

export const updateIdeaSchema = createIdeaSchema.partial().extend({
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED', 'DELETED']).optional(),
});

export const generateIdeaSchema = z.object({
  interests: z.array(z.string().trim().min(1)).min(1, 'Add at least one interest').max(10),
  skills: z.array(z.string().trim().min(1)).min(1, 'Add at least one skill').max(10),
  problemArea: z.string().trim().min(3, 'Describe the problem area').max(200),
  count: z.number().int().min(3).max(5).optional(),
});

export type CreateIdeaInput = z.infer<typeof createIdeaSchema>;
export type UpdateIdeaInput = z.infer<typeof updateIdeaSchema>;
export type GenerateIdeaInput = z.infer<typeof generateIdeaSchema>;
