import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { body } from '../middleware/validation.middleware';
import { getAuthUser } from '../middleware/auth.middleware';
import { profileService } from '../services/profile/profile.service';
import { ChangePasswordInput, UpdateProfileInput } from '../validators/profile.validator';

export const profileController = {
  get: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const data = await profileService.get(id);
    res.json({ success: true, data });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const input = body<UpdateProfileInput>(req);
    const user = await profileService.update(id, input);
    res.json({ success: true, data: { user } });
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const input = body<ChangePasswordInput>(req);
    const result = await profileService.changePassword(id, input);
    res.json({ success: true, data: result });
  }),
};
