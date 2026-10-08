import { Router } from 'express';
import { adminCategoryController } from '../../controllers/admin/admin-category.controller';
import { categorySchema } from '../../controllers/admin/admin-category.controller';
import { validateBody } from '../../middleware/validation.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/admin.middleware';

export const adminCategoryRoutes = Router();

adminCategoryRoutes.use(requireAuth, requireAdmin);
adminCategoryRoutes.get('/categories', adminCategoryController.list);
adminCategoryRoutes.post('/categories', validateBody(categorySchema), adminCategoryController.create);
adminCategoryRoutes.put(
  '/categories/:id',
  validateBody(categorySchema.partial()),
  adminCategoryController.update,
);
adminCategoryRoutes.delete('/categories/:id', adminCategoryController.remove);
