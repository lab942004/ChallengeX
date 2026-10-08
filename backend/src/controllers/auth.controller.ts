import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { body } from '../middleware/validation.middleware';
import { getAuthUser } from '../middleware/auth.middleware';
import { authService } from '../services/auth/auth.service';
import {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from '../validators/auth.validator';
import { JWT_COOKIE_NAME, authCookieOptions, clearAuthCookieOptions } from '../config/security';
import { isProd } from '../config/env';

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const input = body<RegisterInput>(req);
    const { user, token } = await authService.register(input);
    res
      .cookie(JWT_COOKIE_NAME, token, authCookieOptions(false))
      .status(201)
      .json({ success: true, data: { user, tokenType: isProd ? 'cookie' : 'cookie+header' } });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const input = body<LoginInput>(req);
    const { user, token } = await authService.login(input);
    res
      .cookie(JWT_COOKIE_NAME, token, authCookieOptions(input.rememberMe ?? false))
      .json({ success: true, data: { user, tokenType: isProd ? 'cookie' : 'cookie+header' } });
  }),

  logout: asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie(JWT_COOKIE_NAME, clearAuthCookieOptions()).json({
      success: true,
      message: 'Logged out.',
    });
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const user = await authService.me(id);
    res.json({ success: true, data: { user } });
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const input = body<ForgotPasswordInput>(req);
    const result = await authService.forgotPassword(input.email);
    res.json({ success: true, data: result });
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const input = body<ResetPasswordInput>(req);
    const result = await authService.resetPassword(input);
    res.json({ success: true, data: result });
  }),
};
