import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

export interface SettingRecord {
  key: string;
  value: unknown;
  updatedAt: string;
}

const DEFAULT_SETTINGS: Record<string, Prisma.InputJsonValue> = {
  'site.maintenanceMode': false,
  'site.registrationEnabled': true,
  'trial.defaultMode': 'STRESS_TEST',
  'trial.questionsPerTrial': 7,
  'brand.supportEmail': 'support@challengex.com',
};

export const settingsService = {
  async getAll(): Promise<SettingRecord[]> {
    // Ensure defaults exist so the admin UI always has something to edit.
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await prisma.systemSetting.upsert({
        where: { key },
        create: { key, value },
        update: {},
      });
    }
    const rows = await prisma.systemSetting.findMany({ orderBy: { key: 'asc' } });
    return rows.map((r) => ({ key: r.key, value: r.value, updatedAt: r.updatedAt.toISOString() }));
  },

  async set(key: string, value: Prisma.InputJsonValue): Promise<SettingRecord> {
    const row = await prisma.systemSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
    return { key: row.key, value: row.value, updatedAt: row.updatedAt.toISOString() };
  },
};
