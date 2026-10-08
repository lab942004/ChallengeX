import { Router } from 'express';
import { trialController } from '../controllers/trial.controller';
import { verdictController } from '../controllers/verdict.controller';
import { roadmapController } from '../controllers/roadmap.controller';
import { experimentController } from '../controllers/experiment.controller';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import {
  createTrialSchema,
  listTrialsQuerySchema,
  saveAnswerSchema,
} from '../validators/trial.validator';
import { createExperimentSchema } from '../validators/experiment.validator';

/**
 * All trial-scoped resources:
 *   /api/v1/trials                  CRUD + answers + completion
 *   /api/v1/trials/:id/verdict
 *   /api/v1/trials/:id/roadmap
 *   /api/v1/trials/:id/experiments
 */
export const trialRoutes = Router();

trialRoutes.use(requireAuth);

trialRoutes.post('/', validateBody(createTrialSchema), trialController.create);
trialRoutes.get('/', validateQuery(listTrialsQuerySchema), trialController.list);
trialRoutes.get('/:id', trialController.get);
trialRoutes.post('/:id/answers', validateBody(saveAnswerSchema), trialController.saveAnswer);
trialRoutes.post('/:id/complete', trialController.complete);
trialRoutes.get('/:id/verdict', verdictController.get);
trialRoutes.get('/:id/roadmap', roadmapController.getForTrial);
trialRoutes.get('/:id/experiments', experimentController.listForTrial);
trialRoutes.post(
  '/:id/experiments',
  validateBody(createExperimentSchema),
  experimentController.create,
);
