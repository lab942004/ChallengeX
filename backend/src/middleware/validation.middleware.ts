import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { badRequest } from '../utils/errors';

function handleZodError(err: ZodError): never {
  throw badRequest(
    'Validation failed',
    err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
  );
}

/** Validates req.body against the schema; result is stored on req.validatedBody. */
export function validateBody(schema: ZodSchema): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) handleZodError(result.error);
      req.validatedBody = result.data;
      next();
    } catch (err) {
      next(err);
    }
  };
}

/** Validates req.query against the schema. */
export function validateQuery(schema: ZodSchema): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);
      if (!result.success) handleZodError(result.error);
      req.validatedQuery = result.data;
      next();
    } catch (err) {
      next(err);
    }
  };
}

/** Validates req.params against the schema. */
export function validateParams(schema: ZodSchema): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);
      if (!result.success) handleZodError(result.error);
      req.validatedParams = result.data;
      next();
    } catch (err) {
      next(err);
    }
  };
}

/** Convenience accessor used by controllers. */
export function body<T>(req: Request): T {
  return (req.validatedBody ?? req.body) as T;
}
