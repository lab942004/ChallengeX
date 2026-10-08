import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { body } from '../../middleware/validation.middleware';
import { roadmapManagementService } from '../../services/admin/roadmap-management.service';
import { z } from 'zod';

const templateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).optional(),
  order: z.number().int().min(0).optional(),
  objective: z.string().trim().min(3).max(300),
  tasks: z.array(z.string().trim().min(1)).min(1).max(20),
  deliverables: z.array(z.string().trim().min(1)).min(1).max(20),
  estimatedEffort: z.string().trim().max(60).optional(),
  active: z.boolean().optional(),
});

export const adminRoadmapController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const q = req.query as { page?: string; limit?: string; active?: string };
    const { items, meta } = await roadmapManagementService.list({
      page: q.page ? Number(q.page) : undefined,
      limit: q.limit ? Number(q.limit) : undefined,
      active: q.active === 'true' ? true : q.active === 'false' ? false : undefined,
    });
    res.json({ success: true, data: { templates: items, meta } });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const input = body<z.infer<typeof templateSchema>>(req);
    const template = await roadmapManagementService.create(input);
    res.status(201).json({ success: true, data: { template } });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const input = body<Partial<z.infer<typeof templateSchema>>>(req);
    const template = await roadmapManagementService.update(req.params.id, input);
    res.json({ success: true, data: { template } });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await roadmapManagementService.remove(req.params.id);
    res.json({ success: true, message: 'Roadmap template deleted.' });
  }),
};

export { templateSchema };
