import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { body } from '../middleware/validation.middleware';
import { getAuthUser } from '../middleware/auth.middleware';
import { experimentService } from '../services/experiment/experiment.service';
import {
  CreateExperimentInput,
  UpdateExperimentInput,
} from '../validators/experiment.validator';

export const experimentController = {
  listForTrial: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const experiments = await experimentService.listForTrial(id, req.params.id);
    res.json({ success: true, data: { experiments } });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const input = body<CreateExperimentInput>(req);
    const experiment = await experimentService.create(id, req.params.id, input);
    res.status(201).json({ success: true, data: { experiment } });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const input = body<UpdateExperimentInput>(req);
    const experiment = await experimentService.update(id, req.params.id, input);
    res.json({ success: true, data: { experiment } });
  }),
};
