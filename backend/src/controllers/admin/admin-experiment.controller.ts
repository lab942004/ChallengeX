import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { experimentManagementService } from '../../services/admin/experiment-management.service';

export const adminExperimentController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const q = req.query as { page?: string; limit?: string; search?: string; status?: string };
    const { items, meta } = await experimentManagementService.list({
      page: q.page ? Number(q.page) : undefined,
      limit: q.limit ? Number(q.limit) : undefined,
      search: q.search,
      status: q.status,
    });
    res.json({ success: true, data: { experiments: items, meta } });
  }),
};
