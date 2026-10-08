import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { ideaManagementService } from '../../services/admin/idea-management.service';

export const adminIdeaController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const q = req.query as { page?: string; limit?: string; search?: string; status?: never; userId?: string };
    const { items, meta } = await ideaManagementService.list({
      page: q.page ? Number(q.page) : undefined,
      limit: q.limit ? Number(q.limit) : undefined,
      search: q.search,
      status: q.status,
      userId: q.userId,
    });
    res.json({ success: true, data: { ideas: items, meta } });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const idea = await ideaManagementService.get(req.params.id);
    res.json({ success: true, data: { idea } });
  }),
};
