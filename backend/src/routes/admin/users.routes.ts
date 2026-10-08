import { Router } from 'express';
import { adminUserController } from '../../controllers/admin/admin-user.controller';
import { validateBody } from '../../middleware/validation.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/admin.middleware';
import { requireSuperAdmin } from '../../middleware/super-admin.middleware';
import { adminCreateUserSchema, adminUpdateUserSchema } from '../../validators/user.validator';

export const adminUserRoutes = Router();

adminUserRoutes.use(requireAuth, requireAdmin);

adminUserRoutes.get('/users', adminUserController.list);
adminUserRoutes.get('/users/:id', adminUserController.get);
adminUserRoutes.put('/users/:id', validateBody(adminUpdateUserSchema), adminUserController.update);
adminUserRoutes.delete('/users/:id', adminUserController.remove);

// ── Super Admin only: admin management ──
adminUserRoutes.get('/admins', requireSuperAdmin, adminUserController.listAdmins);
adminUserRoutes.post(
  '/admins',
  requireSuperAdmin,
  validateBody(adminCreateUserSchema),
  adminUserController.createAdmin,
);
adminUserRoutes.put(
  '/admins/:id',
  requireSuperAdmin,
  validateBody(adminUpdateUserSchema),
  adminUserController.updateAdmin,
);
adminUserRoutes.delete('/admins/:id', requireSuperAdmin, adminUserController.removeAdmin);
