import { adminApi } from './api';
import { AdminUser } from '../types/admin';
import { PageMeta } from '../types/api';

export interface AdminCreateUserPayload {
  name: string;
  username: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

export const usersService = {
  async list(params: { page?: number; limit?: number; search?: string; role?: string } = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') query.set(k, String(v));
    });
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return adminApi.get<{ users: AdminUser[]; meta: PageMeta }>(`/admin/users${suffix}`);
  },

  async get(id: string) {
    return adminApi.get<{
      user: AdminUser & {
        ideas?: { id: string; title: string; createdAt: string }[];
        trials?: {
          id: string;
          status: string;
          verdict: string | null;
          score: number | null;
          createdAt: string;
        }[];
      };
    }>(`/admin/users/${id}`);
  },

  async update(id: string, payload: Partial<AdminUser>) {
    return adminApi.put<{ user: AdminUser }>(`/admin/users/${id}`, payload);
  },

  async remove(id: string) {
    return adminApi.delete<{ message: string }>(`/admin/users/${id}`);
  },

  // ── Super Admin: admin management ──
  async listAdmins() {
    return adminApi.get<{ admins: AdminUser[] }>('/admin/admins');
  },

  async createAdmin(payload: AdminCreateUserPayload) {
    return adminApi.post<{ admin: AdminUser }>('/admin/admins', payload);
  },

  async updateAdmin(id: string, payload: Partial<AdminUser>) {
    return adminApi.put<{ admin: AdminUser }>(`/admin/admins/${id}`, payload);
  },

  async removeAdmin(id: string) {
    return adminApi.delete<{ message: string }>(`/admin/admins/${id}`);
  },
};
