import { api } from './api';
import { GeneratedIdea, Idea } from '../types/idea';
import { PageMeta } from '../types/api';

export const ideasService = {
  async create(payload: { title: string; description: string }): Promise<{ idea: Idea }> {
    return api.post('/ideas', payload);
  },

  async list(params: { page?: number; limit?: number; search?: string } = {}): Promise<{
    ideas: Idea[];
    meta: PageMeta;
  }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return api.get(`/ideas${suffix}`);
  },

  async get(id: string): Promise<{ idea: Idea }> {
    return api.get(`/ideas/${id}`);
  },

  async update(id: string, payload: Partial<Pick<Idea, 'title' | 'description' | 'status'>>) {
    return api.put<{ idea: Idea }>(`/ideas/${id}`, payload);
  },

  async remove(id: string): Promise<{ message: string }> {
    return api.delete(`/ideas/${id}`);
  },

  async toggleSave(id: string): Promise<{ saved: boolean }> {
    return api.post(`/ideas/${id}/save`);
  },

  async listSaved(): Promise<{ ideas: (Idea & { savedAt: string })[] }> {
    return api.get('/ideas/saved');
  },

  async generate(payload: {
    interests: string[];
    skills: string[];
    problemArea: string;
    count?: number;
  }): Promise<{ ideas: GeneratedIdea[] }> {
    return api.post('/ideas/generate', payload);
  },
};
