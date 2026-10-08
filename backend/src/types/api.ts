import { Role } from '@prisma/client';

/** The authenticated principal attached to every protected request. */
export interface RequestUser {
  id: string;
  role: Role;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: { code: string; message: string; details?: unknown };
  meta?: Record<string, unknown>;
}

export interface AuthTokenPayload {
  sub: string;
  role: Role;
  remember?: boolean;
}

export interface AuthUserDto {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string | null;
  role: Role;
  createdAt: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
