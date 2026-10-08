import { adminApi } from './api';
import { RiskRule } from '../types/content';
import { PageMeta } from '../types/api';

export const riskRulesService = {
  async list(params: { page?: number; limit?: number; search?: string; active?: string } = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') query.set(k, String(v));
    });
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return adminApi.get<{ riskRules: RiskRule[]; meta: PageMeta }>(`/admin/risk-rules${suffix}`);
  },

  async create(payload: {
    name: string;
    description: string;
    category?: string;
    severity?: string;
    threshold?: number | null;
    active?: boolean;
  }) {
    return adminApi.post<{ riskRule: RiskRule }>('/admin/risk-rules', payload);
  },

  async update(id: string, payload: Partial<RiskRule>) {
    return adminApi.put<{ riskRule: RiskRule }>(`/admin/risk-rules/${id}`, payload);
  },

  async remove(id: string) {
    return adminApi.delete<{ message: string }>(`/admin/risk-rules/${id}`);
  },
};
