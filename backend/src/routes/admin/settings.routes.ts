import { Router } from 'express';
import {
  adminSettingsController,
  settingSchema,
} from '../../controllers/admin/admin-settings.controller';
import { validateBody } from '../../middleware/validation.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireSuperAdmin } from '../../middleware/super-admin.middleware';

export const adminSettingsRoutes = Router();

/** Global settings are SUPER_ADMIN territory. */
adminSettingsRoutes.use(requireAuth, requireSuperAdmin);
adminSettingsRoutes.get('/settings', adminSettingsController.getAll);
adminSettingsRoutes.put('/settings', validateBody(settingSchema), adminSettingsController.set);
