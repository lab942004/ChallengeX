/* Frontend-local API types — independent from backend and admin definitions. */

export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string | null;
  role: Role;
  createdAt: string;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiErrorBody;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
