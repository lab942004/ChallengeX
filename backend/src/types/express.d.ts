import { Role } from '@prisma/client';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Set by requireAuth/optionalAuth after JWT verification. */
      user?: { id: string; role: Role };
      /** Parsed+validated request body (set by validation middleware). */
      validatedBody?: unknown;
      /** Parsed+validated query params. */
      validatedQuery?: unknown;
      /** Parsed+validated route params. */
      validatedParams?: unknown;
    }
  }
}

export {};
