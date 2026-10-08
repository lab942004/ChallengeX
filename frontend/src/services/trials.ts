import { api } from './api';
import { Trial, TrialDetail, TrialListItem, TrialMode, Verdict } from '../types/trial';
import { VerdictPayload } from '../types/verdict';
import { PageMeta } from '../types/api';

export const trialsService = {
  async create(payload: { ideaId: string; mode: TrialMode }): Promise<{ trial: Trial }> {
    return api.post('/trials', payload);
  },

  async list(
    params: {
      page?: number;
      limit?: number;
      status?: string;
      verdict?: Verdict;
      search?: string;
      sort?: string;
      order?: 'asc' | 'desc';
    } = {},
  ): Promise<{ trials: TrialListItem[]; meta: PageMeta }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') query.set(key, String(value));
    });
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return api.get(`/trials${suffix}`);
  },

  async get(id: string): Promise<{ trial: TrialDetail }> {
    return api.get(`/trials/${id}`);
  },

  /** Auto-save one answer; survives page refresh via the backend. */
  async saveAnswer(
    trialId: string,
    payload: { questionId: string; answer: string },
  ): Promise<{
    trial: Trial;
    answeredCount: number;
    totalQuestions: number;
    allAnswered: boolean;
  }> {
    return api.post(`/trials/${trialId}/answers`, payload);
  },

  async complete(trialId: string): Promise<{ verdict: VerdictPayload }> {
    return api.post(`/trials/${trialId}/complete`);
  },

  async getVerdict(trialId: string): Promise<{ verdict: VerdictPayload }> {
    return api.get(`/trials/${trialId}/verdict`);
  },
};
