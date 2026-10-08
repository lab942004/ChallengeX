import { Router } from 'express';
import { adminRiskController, riskRuleSchema } from '../../controllers/admin/admin-risk.controller';
import { validateBody } from '../../middleware/validation.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/admin.middleware';

export const adminRiskRoutes = Router();

adminRiskRoutes.use(requireAuth, requireAdmin);
adminRiskRoutes.get('/risk-rules', adminRiskController.list);
adminRiskRoutes.post('/risk-rules', validateBody(riskRuleSchema), adminRiskController.create);
adminRiskRoutes.put(
  '/risk-rules/:id',
  validateBody(riskRuleSchema.partial()),
  adminRiskController.update,
);
adminRiskRoutes.delete('/risk-rules/:id', adminRiskController.remove);
