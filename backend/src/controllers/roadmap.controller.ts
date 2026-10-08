import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { body } from '../middleware/validation.middleware';
import { getAuthUser } from '../middleware/auth.middleware';
import { roadmapService } from '../services/roadmap/roadmap.service';
import { UpdateRoadmapStepInput } from '../validators/roadmap.validator';

export const roadmapController = {
  getForTrial: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const roadmap = await roadmapService.getForTrial(id, req.params.id);
    res.json({ success: true, data: { roadmap } });
  }),

  updateStep: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const input = body<UpdateRoadmapStepInput>(req);
    const roadmap = await roadmapService.updateStep(
      id,
      req.params.id,
      req.params.stepId,
      input,
    );
    res.json({ success: true, data: { roadmap } });
  }),
};
