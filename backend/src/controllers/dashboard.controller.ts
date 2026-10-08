import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { getAuthUser } from '../middleware/auth.middleware';
import { dashboardService } from '../services/user/dashboard.service';

export const dashboardController = {
  stats: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const stats = await dashboardService.getStats(id);
    res.json({ success: true, data: stats });
  }),
};
