import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { analyticsService } from '../../services/admin/analytics.service';

export const adminAnalyticsController = {
  overview: asyncHandler(async (_req: Request, res: Response) => {
    const analytics = await analyticsService.getOverview();
    res.json({ success: true, data: analytics });
  }),
};
