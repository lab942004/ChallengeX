import { api } from './api';
import { Roadmap, StepStatus } from '../types/roadmap';

export const roadmapService = {
  async getForTrial(trialId: string): Promise<{ roadmap: Roadmap | null }> {
    return api.get(`/trials/${trialId}/roadmap`);
  },

  async updateStep(
    roadmapId: string,
    stepId: string,
    status: StepStatus,
  ): Promise<{ roadmap: Roadmap }> {
    return api.put(`/roadmap/${roadmapId}/steps/${stepId}`, { status });
  },
};
