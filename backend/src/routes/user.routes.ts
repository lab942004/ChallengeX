import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth.middleware';

export const userRoutes = Router();

/** Signup availability checks (email/username uniqueness). */
userRoutes.get('/availability', requireAuth, userController.checkAvailability);
