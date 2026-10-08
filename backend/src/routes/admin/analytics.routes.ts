import { Router } from 'express';
import { adminAnalyticsController } from '../../controllers/admin/admin-analytics.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/admin.middleware';

export const adminAnalyticsRoutes = Router();

adminAnalyticsRoutes.use(requireAuth, requireAdmin);
adminAnalyticsRoutes.get('/analytics', adminAnalyticsController.overview);
