import { adminApi } from './api';
import { AdminSession } from '../types/api';

export const adminAuthService = {
  async login(email: string, password: string): Promise<{ user: AdminSession }> {
    return adminApi.post('/auth/login', { email, password, rememberMe: true });
  },

  async me(): Promise<{ user: AdminSession }> {
    return adminApi.get('/auth/me');
  },

  async logout(): Promise<{ message: string }> {
    return adminApi.post('/auth/logout');
  },
};
