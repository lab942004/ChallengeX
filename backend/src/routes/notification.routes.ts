import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { requireAuth } from '../middleware/auth.middleware';

export const notificationRoutes = Router();

notificationRoutes.use(requireAuth);
notificationRoutes.get('/', notificationController.list);
notificationRoutes.get('/unread-count', notificationController.unreadCount);
notificationRoutes.post('/mark-all-read', notificationController.markAllRead);
notificationRoutes.put('/:id/read', notificationController.markRead);
