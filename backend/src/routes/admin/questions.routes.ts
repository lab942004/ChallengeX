import { Router } from 'express';
import { adminQuestionController } from '../../controllers/admin/admin-question.controller';
import { validateBody } from '../../middleware/validation.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/admin.middleware';
import { questionSchema, questionUpdateSchema } from '../../controllers/admin/admin-question.controller';

export const adminQuestionRoutes = Router();

adminQuestionRoutes.use(requireAuth, requireAdmin);
adminQuestionRoutes.get('/questions', adminQuestionController.list);
adminQuestionRoutes.post('/questions', validateBody(questionSchema), adminQuestionController.create);
adminQuestionRoutes.put(
  '/questions/:id',
  validateBody(questionUpdateSchema),
  adminQuestionController.update,
);
adminQuestionRoutes.delete('/questions/:id', adminQuestionController.remove);
