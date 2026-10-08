import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { getAuthUser } from '../middleware/auth.middleware';
import { notificationService } from '../services/notification/notification.service';

export const notificationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const { items, meta } = await notificationService.list(id, { page, limit });
    res.json({ success: true, data: { notifications: items, meta } });
  }),

  unreadCount: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const count = await notificationService.unreadCount(id);
    res.json({ success: true, data: { count } });
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const notification = await notificationService.markRead(id, req.params.id);
    res.json({ success: true, data: { notification } });
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const result = await notificationService.markAllRead(id);
    res.json({ success: true, data: result });
  }),
};
