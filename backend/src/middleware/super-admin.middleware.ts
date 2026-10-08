import { NextFunction, Request, Response } from 'express';
import { forbidden } from '../utils/errors';
import { isSuperAdmin } from '../constants';

/**
 * requireSuperAdmin — only SUPER_ADMIN may pass (admin management,
 * global settings, role changes).
 */
export function requireSuperAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(forbidden());
  if (!isSuperAdmin(req.user.role)) {
    return next(forbidden('Super Admin permission is required for this action.'));
  }
  next();
}
