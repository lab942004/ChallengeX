import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { body } from '../../middleware/validation.middleware';
import { getAuthUser } from '../../middleware/auth.middleware';
import { userManagementService } from '../../services/admin/user-management.service';
import { adminCreateUserSchema, adminUpdateUserSchema } from '../../validators/user.validator';

export const adminUserController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const q = req.query as { page?: string; limit?: string; search?: string; role?: never };
    const { items, meta } = await userManagementService.list({
      page: q.page ? Number(q.page) : undefined,
      limit: q.limit ? Number(q.limit) : undefined,
      search: q.search,
      role: q.role,
    });
    res.json({ success: true, data: { users: items, meta } });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const user = await userManagementService.get(req.params.id);
    res.json({ success: true, data: { user } });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const input = body<ReturnType<typeof adminUpdateUserSchema.parse>>(req);
    const user = await userManagementService.update(req.params.id, input);
    res.json({ success: true, data: { user } });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await userManagementService.remove(req.params.id);
    res.json({ success: true, message: 'User deleted.' });
  }),

  // ── Super Admin: admin management ──
  listAdmins: asyncHandler(async (_req: Request, res: Response) => {
    const admins = await userManagementService.listAdmins();
    res.json({ success: true, data: { admins } });
  }),

  createAdmin: asyncHandler(async (req: Request, res: Response) => {
    const input = body<ReturnType<typeof adminCreateUserSchema.parse>>(req);
    const admin = await userManagementService.createAdmin(input);
    res.status(201).json({ success: true, data: { admin } });
  }),

  updateAdmin: asyncHandler(async (req: Request, res: Response) => {
    const { id: actorId } = getAuthUser(req);
    const input = body<ReturnType<typeof adminUpdateUserSchema.parse>>(req);
    const admin = await userManagementService.updateAdmin(req.params.id, input, actorId);
    res.json({ success: true, data: { admin } });
  }),

  removeAdmin: asyncHandler(async (req: Request, res: Response) => {
    const { id: actorId } = getAuthUser(req);
    await userManagementService.removeAdmin(req.params.id, actorId);
    res.json({ success: true, message: 'Admin removed.' });
  }),
};
