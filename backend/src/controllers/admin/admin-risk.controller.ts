import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { body } from '../../middleware/validation.middleware';
import { riskManagementService } from '../../services/admin/risk-management.service';
import { z } from 'zod';

const riskRuleSchema = z.object({
  name: z.string().trim().min(3).max(80),
  description: z.string().trim().min(5).max(400),
  category: z.string().trim().max(60).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  threshold: z.number().int().min(0).max(100).nullable().optional(),
  active: z.boolean().optional(),
});

export const adminRiskController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const q = req.query as { page?: string; limit?: string; search?: string; active?: string };
    const { items, meta } = await riskManagementService.list({
      page: q.page ? Number(q.page) : undefined,
      limit: q.limit ? Number(q.limit) : undefined,
      search: q.search,
      active: q.active === 'true' ? true : q.active === 'false' ? false : undefined,
    });
    res.json({ success: true, data: { riskRules: items, meta } });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const input = body<z.infer<typeof riskRuleSchema>>(req);
    const riskRule = await riskManagementService.create({
      ...input,
      threshold: input.threshold ?? undefined,
    });
    res.status(201).json({ success: true, data: { riskRule } });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const input = body<Partial<z.infer<typeof riskRuleSchema>>>(req);
    const riskRule = await riskManagementService.update(req.params.id, {
      ...input,
      threshold: input.threshold ?? undefined,
    });
    res.json({ success: true, data: { riskRule } });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await riskManagementService.remove(req.params.id);
    res.json({ success: true, message: 'Risk rule deleted.' });
  }),
};

export { riskRuleSchema };
