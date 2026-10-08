import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { trialManagementService } from '../../services/admin/trial-management.service';

export const adminTrialController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const q = req.query as { page?: string; limit?: string; search?: string; status?: string; verdict?: string };
    const { items, meta } = await trialManagementService.list({
      page: q.page ? Number(q.page) : undefined,
      limit: q.limit ? Number(q.limit) : undefined,
      search: q.search,
      status: q.status,
      verdict: q.verdict,
    });
    res.json({ success: true, data: { trials: items, meta } });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const trial = await trialManagementService.get(req.params.id);
    res.json({ success: true, data: { trial } });
  }),
};
