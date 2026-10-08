import { adminApi } from './api';
import { AdminAnalytics } from '../types/content';

export const analyticsService = {
  /** Aggregations are computed by the backend; this only fetches them. */
  async overview(): Promise<AdminAnalytics> {
    return adminApi.get<AdminAnalytics>('/admin/analytics');
  },
};
