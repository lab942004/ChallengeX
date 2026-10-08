import { adminApi } from './api';
import { AdminExperiment } from '../types/content';
import { PageMeta } from '../types/api';

export const experimentsService = {
  async list(params: { page?: number; limit?: number; search?: string; status?: string } = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') query.set(k, String(v));
    });
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return adminApi.get<{ experiments: AdminExperiment[]; meta: PageMeta }>(
      `/admin/experiments${suffix}`,
    );
  },
};
