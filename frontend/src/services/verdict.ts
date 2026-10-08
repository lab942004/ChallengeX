import { trialsService } from './trials';

/**
 * Verdict access is exposed as its own service for clarity, but it is
 * backed by the trial resource on the backend:
 *   GET /api/v1/trials/:trialId/verdict
 * All scoring/verdict computation happens on the backend.
 */
export const verdictService = {
  get: (trialId: string) => trialsService.getVerdict(trialId),
};
