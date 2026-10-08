import { api } from './api';

export interface Experiment {
  id: string;
  trialId: string;
  title: string;
  description: string;
  steps: string[];
  successMetric: string;
  estimatedCost: string;
  duration: string;
  status: 'DRAFT' | 'PLANNED' | 'RUNNING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export const experimentsService = {
  async listForTrial(trialId: string): Promise<{ experiments: Experiment[] }> {
    return api.get(`/trials/${trialId}/experiments`);
  },

  async create(
    trialId: string,
    payload: Omit<Experiment, 'id' | 'trialId' | 'status' | 'createdAt'> & {
      status?: Experiment['status'];
    },
  ): Promise<{ experiment: Experiment }> {
    return api.post(`/trials/${trialId}/experiments`, payload);
  },

  async update(
    id: string,
    payload: Partial<Omit<Experiment, 'id' | 'trialId' | 'createdAt'>>,
  ): Promise<{ experiment: Experiment }> {
    return api.put(`/experiments/${id}`, payload);
  },
};
