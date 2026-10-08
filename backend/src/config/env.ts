import 'dotenv/config';
import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z
    .string()
    .min(isProduction ? 32 : 8)
    .default('challengex-local-development-secret-0123456789abcdef'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REMEMBER_EXPIRES_IN: z.string().default('30d'),
  JWT_COOKIE_NAME: z.string().default('cx_token'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  ADMIN_URL: z.string().url().default('http://localhost:5174'),
  ALLOWED_ORIGINS: z.string().default(''),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  AI_PROVIDER: z.enum(['mock', 'provider']).default('mock'),
  AI_API_KEY: z.string().default(''),
  EMAIL_PROVIDER: z.string().default(''),
  SMTP_URL: z.string().default(''),
  EMAIL_FROM: z.string().default('no-reply@challengex.com'),
  SEED_SUPER_ADMIN_EMAIL: z.string().email().default('superadmin@challengex.dev'),
  SEED_SUPER_ADMIN_PASSWORD: z.string().min(8).default('ChangeMe_SuperAdmin1!'),
  SEED_ADMIN_EMAIL: z.string().email().default('admin@challengex.dev'),
  SEED_ADMIN_PASSWORD: z.string().min(8).default('ChangeMe_Admin1!'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Never echo the raw values — only the field names that failed.
  const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  throw new Error(`Invalid backend environment configuration — ${issues}`);
}

export const env = parsed.data;

export const isDev = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';
export const isProd = env.NODE_ENV === 'production';

export const allowedOrigins = [
  env.CLIENT_URL,
  env.ADMIN_URL,
  ...env.ALLOWED_ORIGINS.split(',')
    .map((o) => o.trim())
    .filter(Boolean),
];
