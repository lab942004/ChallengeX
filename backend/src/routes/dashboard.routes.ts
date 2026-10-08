import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { requireAuth } from '../middleware/auth.middleware';

export const dashboardRoutes = Router();

dashboardRoutes.use(requireAuth);
/** All dashboard numbers are computed by the backend. */
dashboardRoutes.get('/stats', dashboardController.stats);
