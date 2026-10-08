import { ApiResponse } from '../types/api';

export const ADMIN_API_URL = '/api/v1';

export class AdminApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
}

/** Fetch wrapper — HTTP-only cookie auth (credentials: 'include'). */
export async function adminRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body } = options;
  const url = `${ADMIN_API_URL}${path.startsWith('/') ? path : `/${path}`}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      credentials: 'include',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new AdminApiError(
      0,
      'NETWORK_ERROR',
      'Could not reach the ChallengeX API. Is the backend running?',
    );
  }

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.success === false) {
    const code = payload?.error?.code ?? `HTTP_${response.status}`;
    const message =
      payload?.error?.message ??
      (response.status === 401
        ? 'Session expired. Please log in again.'
        : response.status === 403
          ? 'You do not have permission to perform this action.'
          : response.status >= 500
            ? 'Server error. Please try again.'
            : 'Request failed.');
    throw new AdminApiError(response.status, code, message, payload?.error?.details);
  }

  return (payload?.data ?? (payload as unknown as T)) as T;
}

export const adminApi = {
  get: <T>(path: string) => adminRequest<T>(path),
  post: <T>(path: string, body?: unknown) => adminRequest<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => adminRequest<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string) => adminRequest<T>(path, { method: 'DELETE' }),
};
