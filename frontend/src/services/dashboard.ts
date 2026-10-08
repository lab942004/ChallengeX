import { api } from './api';
import { DashboardStats } from '../types/dashboard';

export const dashboardService = {
  /** All numbers are computed by the backend — the UI only renders them. */
  async stats(): Promise<DashboardStats> {
    return api.get('/dashboard/stats');
  },
};
