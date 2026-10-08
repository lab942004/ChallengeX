import { ApiResponse } from '../types/api';

export const API_URL = '/api/v1';

/** Client-side error with backend error code/message attached. */
export class ApiClientError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
}

/**
 * Fetch wrapper. Auth uses HTTP-only cookies (credentials: 'include'),
 * so no token ever touches frontend JavaScript.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal } = options;
  const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      credentials: 'include',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    throw new ApiClientError(
      0,
      'NETWORK_ERROR',
      'THE CONNECTION TO THE REALM WAS LOST. Check your connection and try again.',
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
        ? 'YOU SHALL NOT ENTER. Please log in.'
        : response.status === 403
          ? 'You do not have permission to do that.'
          : response.status === 404
            ? 'THE PATH HAS VANISHED. Resource not found.'
            : response.status >= 500
              ? 'THE REALM HAS FAILED. Something went wrong.'
              : 'The request could not be completed.');
    throw new ApiClientError(response.status, code, message, payload?.error?.details);
  }

  return (payload?.data ?? (payload as unknown as T)) as T;
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { method: 'GET', signal }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
