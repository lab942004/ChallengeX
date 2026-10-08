import { Router } from 'express';
import { adminIdeaController } from '../../controllers/admin/admin-idea.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/admin.middleware';

export const adminIdeaRoutes = Router();

adminIdeaRoutes.use(requireAuth, requireAdmin);
adminIdeaRoutes.get('/ideas', adminIdeaController.list);
adminIdeaRoutes.get('/ideas/:id', adminIdeaController.get);
