import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { getAuthUser } from '../middleware/auth.middleware';
import { verdictService } from '../services/verdict/verdict.service';

export const verdictController = {
  get: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const verdict = await verdictService.getVerdict(id, req.params.id);
    res.json({ success: true, data: { verdict } });
  }),
};
