import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { body } from '../../middleware/validation.middleware';
import { categoryManagementService } from '../../services/admin/category-management.service';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().max(300).optional(),
  order: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
});

export const adminCategoryController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const categories = await categoryManagementService.list();
    res.json({ success: true, data: { categories } });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const input = body<z.infer<typeof categorySchema>>(req);
    const category = await categoryManagementService.create(input);
    res.status(201).json({ success: true, data: { category } });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const input = body<Partial<z.infer<typeof categorySchema>>>(req);
    const category = await categoryManagementService.update(req.params.id, input);
    res.json({ success: true, data: { category } });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await categoryManagementService.remove(req.params.id);
    res.json({ success: true, message: 'Category deleted.' });
  }),
};

export { categorySchema };
