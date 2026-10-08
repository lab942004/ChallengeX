import { adminApi } from './api';
import { RoadmapTemplate } from '../types/content';
import { PageMeta } from '../types/api';

export const roadmapsService = {
  async list(params: { page?: number; limit?: number; active?: string } = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') query.set(k, String(v));
    });
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return adminApi.get<{ templates: RoadmapTemplate[]; meta: PageMeta }>(
      `/admin/roadmaps${suffix}`,
    );
  },

  async create(payload: {
    name: string;
    description?: string;
    order?: number;
    objective: string;
    tasks: string[];
    deliverables: string[];
    estimatedEffort?: string;
    active?: boolean;
  }) {
    return adminApi.post<{ template: RoadmapTemplate }>('/admin/roadmaps', payload);
  },

  async update(id: string, payload: Partial<RoadmapTemplate>) {
    return adminApi.put<{ template: RoadmapTemplate }>(`/admin/roadmaps/${id}`, payload);
  },

  async remove(id: string) {
    return adminApi.delete<{ message: string }>(`/admin/roadmaps/${id}`);
  },
};
