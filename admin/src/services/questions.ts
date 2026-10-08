import { adminApi } from './api';
import { ChallengeQuestion } from '../types/content';
import { PageMeta } from '../types/api';

export const questionsService = {
  async list(
    params: { page?: number; limit?: number; search?: string; categoryId?: string; active?: string } = {},
  ) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') query.set(k, String(v));
    });
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return adminApi.get<{ questions: ChallengeQuestion[]; meta: PageMeta }>(
      `/admin/questions${suffix}`,
    );
  },

  async create(payload: {
    categoryId: string;
    question: string;
    riskLevel?: string;
    explanation?: string;
    order?: number;
  }) {
    return adminApi.post<{ question: ChallengeQuestion }>('/admin/questions', payload);
  },

  async update(id: string, payload: Partial<ChallengeQuestion>) {
    return adminApi.put<{ question: ChallengeQuestion }>(`/admin/questions/${id}`, payload);
  },

  async remove(id: string) {
    return adminApi.delete<{ message: string }>(`/admin/questions/${id}`);
  },
};
