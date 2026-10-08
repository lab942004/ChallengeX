import { adminApi } from './api';
import { AdminIdea } from '../types/admin';
import { PageMeta } from '../types/api';

export const ideasService = {
  async list(params: { page?: number; limit?: number; search?: string; status?: string; userId?: string } = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') query.set(k, String(v));
    });
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return adminApi.get<{ ideas: AdminIdea[]; meta: PageMeta }>(`/admin/ideas${suffix}`);
  },

  async get(id: string) {
    return adminApi.get<{
      idea: AdminIdea & {
        trials: { id: string; mode: string; status: string; verdict: string | null; score: number | null; createdAt: string }[];
        savedBy: { userId: string }[];
      };
    }>(`/admin/ideas/${id}`);
  },
};
