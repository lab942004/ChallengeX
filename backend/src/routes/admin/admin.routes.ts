import { Router } from 'express';
import { adminUserRoutes } from './users.routes';
import { adminIdeaRoutes } from './ideas.routes';
import { adminTrialRoutes } from './trials.routes';
import { adminQuestionRoutes } from './questions.routes';
import { adminCategoryRoutes } from './categories.routes';
import { adminRiskRoutes } from './risk-rules.routes';
import { adminRoadmapRoutes } from './roadmaps.routes';
import { adminExperimentRoutes } from './experiments.routes';
import { adminAnalyticsRoutes } from './analytics.routes';
import { adminSettingsRoutes } from './settings.routes';

/**
 * /api/v1/admin/* — every sub-router applies requireAuth + requireAdmin
 * (and requireSuperAdmin where appropriate) on the SERVER.
 *
 * A USER requesting any of these endpoints receives 403 FORBIDDEN.
 */
export const adminRoutes = Router();

adminRoutes.use(adminUserRoutes);
adminRoutes.use(adminIdeaRoutes);
adminRoutes.use(adminTrialRoutes);
adminRoutes.use(adminQuestionRoutes);
adminRoutes.use(adminCategoryRoutes);
adminRoutes.use(adminRiskRoutes);
adminRoutes.use(adminRoadmapRoutes);
adminRoutes.use(adminExperimentRoutes);
adminRoutes.use(adminAnalyticsRoutes);
adminRoutes.use(adminSettingsRoutes);
