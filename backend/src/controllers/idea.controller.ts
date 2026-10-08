import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { body } from '../middleware/validation.middleware';
import { getAuthUser } from '../middleware/auth.middleware';
import { ideaService } from '../services/idea/idea.service';
import {
  CreateIdeaInput,
  GenerateIdeaInput,
  UpdateIdeaInput,
} from '../validators/idea.validator';
import { notFound } from '../utils/errors';

export const ideaController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const input = body<CreateIdeaInput>(req);
    const idea = await ideaService.create(id, input);
    res.status(201).json({ success: true, data: { idea } });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const q = req.query as { page?: string; limit?: string; search?: string; saved?: string };
    const { items, meta } = await ideaService.list(id, {
      page: q.page ? Number(q.page) : undefined,
      limit: q.limit ? Number(q.limit) : undefined,
      search: q.search,
      saved: q.saved === 'true',
    });
    res.json({ success: true, data: { ideas: items, meta } });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const idea = await ideaService.get(id, req.params.id);
    res.json({ success: true, data: { idea } });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const input = body<UpdateIdeaInput>(req);
    const idea = await ideaService.update(id, req.params.id, input);
    res.json({ success: true, data: { idea } });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    await ideaService.remove(id, req.params.id);
    res.json({ success: true, message: 'Idea deleted.' });
  }),

  toggleSave: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const result = await ideaService.toggleSave(id, req.params.id);
    res.json({ success: true, data: result });
  }),

  listSaved: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const ideas = await ideaService.listSaved(id);
    res.json({ success: true, data: { ideas } });
  }),

  generate: asyncHandler(async (req: Request, res: Response) => {
    const { id } = getAuthUser(req);
    const input = body<GenerateIdeaInput>(req);
    const ideas = await ideaService.generate(id, input);
    res.json({ success: true, data: { ideas } });
  }),
};

export { notFound };
