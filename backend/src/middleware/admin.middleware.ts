import { NextFunction, Request, Response } from 'express';
import { forbidden } from '../utils/errors';
import { isAdminRole } from '../constants';

/**
 * requireAdmin — ADMIN and SUPER_ADMIN may pass.
 * Enforced on the SERVER for every /api/v1/admin/* route.
 * Frontend route protection alone is never sufficient.
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(forbidden());
  if (!isAdminRole(req.user.role)) {
    return next(forbidden('You do not have permission to access admin resources.'));
  }
  next();
}
