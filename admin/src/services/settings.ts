import { adminApi } from './api';
import { SettingRecord } from '../types/content';

export const settingsService = {
  async getAll() {
    return adminApi.get<{ settings: SettingRecord[] }>('/admin/settings');
  },

  async set(key: string, value: unknown) {
    return adminApi.put<{ setting: SettingRecord }>('/admin/settings', { key, value });
  },
};
