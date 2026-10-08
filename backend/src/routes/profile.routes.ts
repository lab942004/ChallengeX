import { Router } from 'express';
import { profileController } from '../controllers/profile.controller';
import { validateBody } from '../middleware/validation.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { changePasswordSchema, updateProfileSchema } from '../validators/profile.validator';

export const profileRoutes = Router();

profileRoutes.use(requireAuth);
profileRoutes.get('/', profileController.get);
profileRoutes.put('/', validateBody(updateProfileSchema), profileController.update);
profileRoutes.put('/password', validateBody(changePasswordSchema), profileController.changePassword);
