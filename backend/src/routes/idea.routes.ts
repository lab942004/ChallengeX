import { Router } from 'express';
import { ideaController } from '../controllers/idea.controller';
import { validateBody } from '../middleware/validation.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { aiLimiter } from '../middleware/rate-limit.middleware';
import {
  createIdeaSchema,
  generateIdeaSchema,
  updateIdeaSchema,
} from '../validators/idea.validator';

export const ideaRoutes = Router();

ideaRoutes.use(requireAuth);

ideaRoutes.post('/', validateBody(createIdeaSchema), ideaController.create);
ideaRoutes.get('/', ideaController.list);
ideaRoutes.post('/generate', aiLimiter, validateBody(generateIdeaSchema), ideaController.generate);
ideaRoutes.get('/saved', ideaController.listSaved);
ideaRoutes.get('/:id', ideaController.get);
ideaRoutes.put('/:id', validateBody(updateIdeaSchema), ideaController.update);
ideaRoutes.delete('/:id', ideaController.remove);
ideaRoutes.post('/:id/save', ideaController.toggleSave);
