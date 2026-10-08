import { Router } from 'express';
import { roadmapController } from '../controllers/roadmap.controller';
import { validateBody } from '../middleware/validation.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { updateRoadmapStepSchema } from '../validators/roadmap.validator';

/**
 * Roadmap mutation route:
 *   PUT /api/v1/roadmap/:id/steps/:stepId
 * (The read route lives in trial.routes.ts → GET /api/v1/trials/:id/roadmap.)
 */
export const roadmapRoutes = Router();

roadmapRoutes.use(requireAuth);
roadmapRoutes.put(
  '/:id/steps/:stepId',
  validateBody(updateRoadmapStepSchema),
  roadmapController.updateStep,
);
