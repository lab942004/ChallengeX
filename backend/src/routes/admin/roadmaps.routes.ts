import { Router } from 'express';
import {
  adminRoadmapController,
  templateSchema,
} from '../../controllers/admin/admin-roadmap.controller';
import { validateBody } from '../../middleware/validation.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/admin.middleware';

export const adminRoadmapRoutes = Router();

adminRoadmapRoutes.use(requireAuth, requireAdmin);
adminRoadmapRoutes.get('/roadmaps', adminRoadmapController.list);
adminRoadmapRoutes.post('/roadmaps', validateBody(templateSchema), adminRoadmapController.create);
adminRoadmapRoutes.put(
  '/roadmaps/:id',
  validateBody(templateSchema.partial()),
  adminRoadmapController.update,
);
adminRoadmapRoutes.delete('/roadmaps/:id', adminRoadmapController.remove);
