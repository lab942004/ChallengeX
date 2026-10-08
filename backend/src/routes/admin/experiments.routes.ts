import { Router } from 'express';
import { adminExperimentController } from '../../controllers/admin/admin-experiment.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/admin.middleware';

export const adminExperimentRoutes = Router();

adminExperimentRoutes.use(requireAuth, requireAdmin);
adminExperimentRoutes.get('/experiments', adminExperimentController.list);
