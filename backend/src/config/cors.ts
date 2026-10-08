import { CorsOptions } from 'cors';
import { allowedOrigins } from './env';

/**
 * CORS is locked to the frontend (CLIENT_URL) and admin (ADMIN_URL)
 * origins, plus any extra origins supplied via ALLOWED_ORIGINS.
 * Credentials (HTTP-only cookies) are allowed only for those origins.
 */
export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Allow non-browser tools (curl, server-to-server) and same-origin requests.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Request-Id'],
  maxAge: 600,
};
