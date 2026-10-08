import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/database';
import { JWT_COOKIE_NAME } from '../config/security';
import { ApiError, unauthorized } from '../utils/errors';
import { verifyAuthToken } from '../utils/jwt';
import { RequestUser } from '../types/api';

function extractToken(req: Request): string | undefined {
  const cookieToken = req.cookies?.[JWT_COOKIE_NAME] as string | undefined;
  if (cookieToken) return cookieToken;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return undefined;
}

/**
 * requireAuth — verifies the JWT (HTTP-only cookie or Bearer header) and
 * loads the CURRENT user from the database so role changes take effect
 * immediately. Attaches `req.user`.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) throw unauthorized();

    let payload;
    try {
      payload = verifyAuthToken(token);
    } catch {
      throw unauthorized('Your session has expired. Please log in again.');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true },
    });
    if (!user) throw unauthorized('Your account no longer exists.');

    req.user = { id: user.id, role: user.role } satisfies RequestUser;
    next();
  } catch (err) {
    next(err);
  }
}

/** Attaches the user without requiring auth (optional authentication). */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) return next();
    const payload = verifyAuthToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true },
    });
    if (user) req.user = { id: user.id, role: user.role };
    next();
  } catch {
    next(); // invalid optional token → proceed unauthenticated
  }
}

export function getAuthUser(req: Request): RequestUser {
  if (!req.user) throw unauthorized();
  return req.user;
}

export { ApiError };
