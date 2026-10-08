import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validation.middleware';
import { authLimiter } from '../middleware/rate-limit.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';

export const authRoutes = Router();

authRoutes.post('/register', authLimiter, validateBody(registerSchema), authController.register);
authRoutes.post('/login', authLimiter, validateBody(loginSchema), authController.login);
authRoutes.post('/logout', authController.logout);
authRoutes.get('/me', requireAuth, authController.me);
authRoutes.post(
  '/forgot-password',
  authLimiter,
  validateBody(forgotPasswordSchema),
  authController.forgotPassword,
);
authRoutes.post(
  '/reset-password',
  authLimiter,
  validateBody(resetPasswordSchema),
  authController.resetPassword,
);
