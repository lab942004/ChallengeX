import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/cors';
import { helmetOptions } from './config/security';
import { API_PREFIX } from './constants';
import { apiLimiter } from './middleware/rate-limit.middleware';
import { notFoundHandler } from './middleware/not-found.middleware';
import { errorHandler } from './middleware/error.middleware';

import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { ideaRoutes } from './routes/idea.routes';
import { trialRoutes } from './routes/trial.routes';
import { roadmapRoutes } from './routes/roadmap.routes';
import { experimentRoutes } from './routes/experiment.routes';
import { notificationRoutes } from './routes/notification.routes';
import { profileRoutes } from './routes/profile.routes';
import { dashboardRoutes } from './routes/dashboard.routes';
import { adminRoutes } from './routes/admin/admin.routes';

export function createApp(): Application {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmetOptions);
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Health check (outside the limiter for monitoring).
  app.get('/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', service: 'challengex-api' } });
  });

  app.use(API_PREFIX, apiLimiter);

  // ── Public + user API ──
  app.use(`${API_PREFIX}/auth`, authRoutes);
  app.use(`${API_PREFIX}/users`, userRoutes);
  app.use(`${API_PREFIX}/ideas`, ideaRoutes);
  app.use(`${API_PREFIX}/trials`, trialRoutes);
  app.use(`${API_PREFIX}/roadmap`, roadmapRoutes);
  app.use(`${API_PREFIX}/experiments`, experimentRoutes);
  app.use(`${API_PREFIX}/notifications`, notificationRoutes);
  app.use(`${API_PREFIX}/profile`, profileRoutes);
  app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);

  // ── Admin API (RBAC enforced inside each router) ──
  app.use(`${API_PREFIX}/admin`, adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
