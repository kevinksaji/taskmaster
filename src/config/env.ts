import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
  BOT_TOKEN: z.string().min(1, 'BOT_TOKEN is required'),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(1, 'TELEGRAM_WEBHOOK_SECRET is required'),
  STORAGE_DATABASE_URL: z.string().min(1, 'STORAGE_DATABASE_URL is required'),
  STORAGE_DATABASE_URL_UNPOOLED: z.string().min(1, 'STORAGE_DATABASE_URL_UNPOOLED is required'),
  REDIS_URL: z.string().url('REDIS_URL must be a valid URL'),
  SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(604800),
  APP_BASE_URL: z.string().url('APP_BASE_URL must be a valid URL'),
  PORT: z.coerce.number().int().positive().default(3000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const message = parsed.error.issues.map((issue) => issue.message).join('; ');
  throw new Error(`Invalid environment configuration: ${message}`);
}

export const env = {
  ...parsed.data,
  APP_BASE_URL: parsed.data.APP_BASE_URL.replace(/\/$/, ''),
};
