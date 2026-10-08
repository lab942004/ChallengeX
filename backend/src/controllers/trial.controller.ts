import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { body } from '../middleware/validation.middleware';
import { getAuthUser } from '../middleware/auth.middleware';
import { trialService } from '../services/trial/trial.service';
import { CreateTrialInput, ListTrialsQuery, SaveAnswerInput } from '../validators/trial.validator';

export const trialController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const input = body<CreateTrialInput>(req);
    const trial = await trialService.create(id, input);
    res.status(201).json({ success: true, data: { trial } });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const query = req.validatedQuery as ListTrialsQuery | undefined;
    const { items, meta } = await trialService.list(id, query ?? (req.query as ListTrialsQuery));
    res.json({ success: true, data: { trials: items, meta } });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const trial = await trialService.getDetail(id, req.params.id);
    res.json({ success: true, data: { trial } });
  }),

  saveAnswer: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const input = body<SaveAnswerInput>(req);
    const result = await trialService.saveAnswer(id, req.params.id, input);
    res.json({ success: true, data: result });
  }),

  /** Completion is handled by the verdict service (full analysis pipeline). */
  complete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const { verdictService } = await import('../services/verdict/verdict.service');
    const verdict = await verdictService.complete(id, req.params.id);
    res.json({ success: true, data: { verdict } });
  }),
};
