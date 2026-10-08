import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { body } from '../../middleware/validation.middleware';
import { questionManagementService } from '../../services/admin/question-management.service';
import { z } from 'zod';

const questionSchema = z.object({
  categoryId: z.string().min(1),
  question: z.string().trim().min(10).max(500),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  explanation: z.string().trim().max(400).optional(),
  order: z.number().int().min(0).optional(),
});

const questionUpdateSchema = questionSchema.partial();

export const adminQuestionController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const q = req.query as { page?: string; limit?: string; search?: string; categoryId?: string; active?: string };
    const { items, meta } = await questionManagementService.list({
      page: q.page ? Number(q.page) : undefined,
      limit: q.limit ? Number(q.limit) : undefined,
      search: q.search,
      categoryId: q.categoryId,
      active: q.active === 'true' ? true : q.active === 'false' ? false : undefined,
    });
    res.json({ success: true, data: { questions: items, meta } });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const input = body<z.infer<typeof questionSchema>>(req);
    const question = await questionManagementService.create(input);
    res.status(201).json({ success: true, data: { question } });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const input = body<z.infer<typeof questionUpdateSchema>>(req);
    const question = await questionManagementService.update(req.params.id, input);
    res.json({ success: true, data: { question } });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await questionManagementService.remove(req.params.id);
    res.json({ success: true, message: 'Question deleted.' });
  }),
};

export { questionSchema, questionUpdateSchema };
