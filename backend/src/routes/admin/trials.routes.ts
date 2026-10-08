import { Router } from 'express';
import { adminTrialController } from '../../controllers/admin/admin-trial.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/admin.middleware';

export const adminTrialRoutes = Router();

adminTrialRoutes.use(requireAuth, requireAdmin);
adminTrialRoutes.get('/trials', adminTrialController.list);
adminTrialRoutes.get('/trials/:id', adminTrialController.get);
