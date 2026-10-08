import { adminApi } from './api';
import { ChallengeCategory } from '../types/content';

export const categoriesService = {
  async list() {
    return adminApi.get<{ categories: ChallengeCategory[] }>('/admin/categories');
  },

  async create(payload: { name: string; description?: string; order?: number; active?: boolean }) {
    return adminApi.post<{ category: ChallengeCategory }>('/admin/categories', payload);
  },

  async update(id: string, payload: Partial<ChallengeCategory>) {
    return adminApi.put<{ category: ChallengeCategory }>(`/admin/categories/${id}`, payload);
  },

  async remove(id: string) {
    return adminApi.delete<{ message: string }>(`/admin/categories/${id}`);
  },
};
