import { CookieOptions } from 'express';
import helmet from 'helmet';
import { env, isProd } from './env';

/** Security headers (helmet) tuned for a JSON API consumed by two SPAs. */
export const helmetOptions = helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  referrerPolicy: { policy: 'no-referrer' },
  hsts: isProd ? { maxAge: 15552000, includeSubDomains: true } : false,
});

/**
 * Cookie options for the JWT session cookie.
 * - HTTP-only: JavaScript can never read the token.
 * - Secure only in production (local dev runs on http://localhost).
 * - SameSite=None+Secure in production so the two SPAs on different
 *   subdomains can send the cookie; Lax in development where both
 *   apps run on localhost with different ports.
 */
export function authCookieOptions(rememberMe: boolean): CookieOptions {
  const maxAge = rememberMe
    ? 30 * 24 * 60 * 60 * 1000 // 30 days
    : 24 * 60 * 60 * 1000; // 1 day
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge,
    signed: false,
  };
}

export function clearAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  };
}

export const JWT_COOKIE_NAME = env.JWT_COOKIE_NAME;
