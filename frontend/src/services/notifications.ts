import { api } from './api';
import { AppNotification } from '../types/notification';
import { PageMeta } from '../types/api';

export const notificationsService = {
  async list(params: { page?: number; limit?: number } = {}): Promise<{
    notifications: AppNotification[];
    meta: PageMeta;
  }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return api.get(`/notifications${suffix}`);
  },

  async unreadCount(): Promise<{ count: number }> {
    return api.get('/notifications/unread-count');
  },

  async markRead(id: string): Promise<{ notification: AppNotification }> {
    return api.put(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<{ updated: number }> {
    return api.post('/notifications/mark-all-read');
  },
};
