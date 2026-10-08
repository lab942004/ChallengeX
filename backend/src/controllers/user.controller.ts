import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { userService } from '../services/user/user.service';

export const userController = {
  checkAvailability: asyncHandler(async (req: Request, res: Response) => {
    const email = typeof req.query.email === 'string' ? req.query.email : undefined;
    const username = typeof req.query.username === 'string' ? req.query.username : undefined;
    const result: Record<string, boolean> = {};
    if (email) result.emailAvailable = await userService.isEmailAvailable(email);
    if (username) result.usernameAvailable = await userService.isUsernameAvailable(username);
    res.json({ success: true, data: result });
  }),
};
