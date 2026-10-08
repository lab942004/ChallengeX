import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/errors';
import { isProd } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Central error handler. Stack traces and internal details are NEVER
 * leaked to clients in production.
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  // Malformed JSON body (body-parser SyntaxError) → 400, never a stack trace.
  if (err instanceof SyntaxError && 'status' in err && (err as { status?: number }).status === 400) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_JSON', message: 'Malformed JSON payload.' },
    });
  }

  // CORS origin rejection → 403
  if (err instanceof Error && err.message.includes('not allowed by CORS')) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN_ORIGIN', message: 'Origin not allowed.' },
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      },
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = (err.meta?.target as string[] | undefined)?.join(', ') ?? 'field';
      return res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: `A record with this ${field} already exists.` },
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Resource not found.' },
      });
    }
  }

  logger.error('Unhandled error', {
    path: req.originalUrl,
    method: req.method,
    message: err instanceof Error ? err.message : String(err),
    ...(isProd ? {} : { stack: err instanceof Error ? err.stack : undefined }),
  });

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'THE REALM HAS FAILED. Something went wrong on our side.',
      ...(isProd ? {} : { details: err instanceof Error ? err.message : String(err) }),
    },
  });
}
