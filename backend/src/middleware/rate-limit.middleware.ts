import rateLimit from 'express-rate-limit';
import { env, isTest } from '../config/env';

const skipInTests = () => isTest;

/** General API limiter — applied to /api/v1. */
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' } },
});

/** Stricter limiter for authentication endpoints (login/register/reset). */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many authentication attempts. Please try again later.' } },
});

/** Limiter for AI-backed endpoints (idea generation). */
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'AI generation limit reached. Try again later.' } },
});
