import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { body } from '../../middleware/validation.middleware';
import { settingsService } from '../../services/admin/settings.service';
import { z } from 'zod';

const settingSchema = z.object({
  key: z.string().trim().min(3).max(80),
  value: z.unknown(),
});

export const adminSettingsController = {
  getAll: asyncHandler(async (_req: Request, res: Response) => {
    const settings = await settingsService.getAll();
    res.json({ success: true, data: { settings } });
  }),

  set: asyncHandler(async (req: Request, res: Response) => {
    const input = body<z.infer<typeof settingSchema>>(req);
    const setting = await settingsService.set(
      input.key,
      input.value as Record<string, never>,
    );
    res.json({ success: true, data: { setting } });
  }),
};

export { settingSchema };
