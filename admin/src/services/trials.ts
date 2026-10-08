import { adminApi } from './api';
import { AdminTrial } from '../types/admin';
import { PageMeta } from '../types/api';

export const trialsService = {
  async list(
    params: { page?: number; limit?: number; search?: string; status?: string; verdict?: string } = {},
  ) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') query.set(k, String(v));
    });
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return adminApi.get<{ trials: AdminTrial[]; meta: PageMeta }>(`/admin/trials${suffix}`);
  },

  async get(id: string) {
    return adminApi.get<{
      trial: AdminTrial & {
        idea: { id: string; title: string; description: string };
        questions: {
          id: string;
          category: string;
          question: string;
          order: number;
          riskLevel: string;
          answers: { answer: string }[];
        }[];
        assumptions: unknown[];
        risks: unknown[];
        recommendations: unknown[];
        experiment: { title: string } | null;
        roadmap: { title: string; status: string; steps: { title: string; status: string }[] } | null;
      };
    }>(`/admin/trials/${id}`);
  },
};
