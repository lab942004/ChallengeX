import { describe, expect, it } from 'vitest';
import { isAdminRole, isSuperAdmin } from '../../src/constants';
import { requireAdmin } from '../../src/middleware/admin.middleware';
import { requireSuperAdmin } from '../../src/middleware/super-admin.middleware';
import { ApiError } from '../../src/utils/errors';
import { Request, Response } from 'express';

function fakeReq(role?: string): Request {
  return { user: role ? { id: 'u1', role } : undefined } as unknown as Request;
}
const fakeRes = {} as Response;

function run(fn: (req: Request, res: Response, next: (err?: unknown) => void) => void, role?: string) {
  let captured: unknown = null;
  fn(fakeReq(role), fakeRes, (err?: unknown) => {
    captured = err ?? null;
  });
  return captured;
}

describe('RBAC helpers', () => {
  it('recognises admin roles', () => {
    expect(isAdminRole('ADMIN')).toBe(true);
    expect(isAdminRole('SUPER_ADMIN')).toBe(true);
    expect(isAdminRole('USER')).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
  });

  it('recognises super admin only', () => {
    expect(isSuperAdmin('SUPER_ADMIN')).toBe(true);
    expect(isSuperAdmin('ADMIN')).toBe(false);
    expect(isSuperAdmin('USER')).toBe(false);
  });
});

describe('admin middleware (server-side enforcement)', () => {
  it('allows ADMIN through', () => {
    expect(run(requireAdmin, 'ADMIN')).toBeNull();
  });

  it('allows SUPER_ADMIN through', () => {
    expect(run(requireSuperAdmin, 'SUPER_ADMIN')).toBeNull();
  });

  it('rejects USER with 403 FORBIDDEN', () => {
    const err = run(requireAdmin, 'USER');
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(403);
    expect((err as ApiError).code).toBe('FORBIDDEN');
  });

  it('rejects unauthenticated requests', () => {
    const err = run(requireAdmin, undefined);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(403);
  });

  it('rejects ADMIN on super-admin routes', () => {
    const err = run(requireSuperAdmin, 'ADMIN');
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(403);
  });
});
