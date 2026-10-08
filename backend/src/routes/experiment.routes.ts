import { Router } from 'express';
import { experimentController } from '../controllers/experiment.controller';
import { validateBody } from '../middleware/validation.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { updateExperimentSchema } from '../validators/experiment.validator';

/**
 * Experiment mutation route:
 *   PUT /api/v1/experiments/:id
 * (Trial-scoped experiment routes live in trial.routes.ts.)
 */
export const experimentRoutes = Router();

experimentRoutes.use(requireAuth);
experimentRoutes.put('/:id', validateBody(updateExperimentSchema), experimentController.update);
