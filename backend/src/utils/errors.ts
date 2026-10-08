/** Application error with an HTTP status and a stable machine-readable code. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message = 'Invalid request', details?: unknown) =>
  new ApiError(400, 'BAD_REQUEST', message, details);

export const unauthorized = (message = 'You shall not enter') =>
  new ApiError(401, 'UNAUTHORIZED', message);

export const forbidden = (message = 'Forbidden') => new ApiError(403, 'FORBIDDEN', message);

export const notFound = (message = 'Resource not found') => new ApiError(404, 'NOT_FOUND', message);

export const conflict = (message = 'Resource already exists') =>
  new ApiError(409, 'CONFLICT', message);

export const tooManyRequests = (message = 'Too many requests') =>
  new ApiError(429, 'RATE_LIMITED', message);

export const internal = (message = 'Internal server error') =>
  new ApiError(500, 'INTERNAL_ERROR', message);

export const serviceUnavailable = (message = 'Service unavailable') =>
  new ApiError(503, 'SERVICE_UNAVAILABLE', message);
