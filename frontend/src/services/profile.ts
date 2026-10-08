import { api } from './api';
import { AuthUser } from '../types/api';

export interface ProfileStats {
  ideas: number;
  trials: number;
  builds: number;
  pivots: number;
  kills: number;
}

export const profileService = {
  async get(): Promise<{ user: AuthUser; stats: ProfileStats }> {
    return api.get('/profile');
  },

  async update(payload: {
    name?: string;
    username?: string;
    avatar?: string | null;
  }): Promise<{ user: AuthUser }> {
    return api.put('/profile', payload);
  },

  async changePassword(payload: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }): Promise<{ message: string }> {
    return api.put('/profile/password', payload);
  },
};
