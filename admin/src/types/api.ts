/* Admin-local API types — independent from frontend and backend definitions. */

export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface AdminSession {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string | null;
  role: Role;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: { code: string; message: string; details?: unknown };
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ListResponse<T> {
  items: T[];
  meta: PageMeta;
}
