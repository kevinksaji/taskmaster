import { Redis } from '@upstash/redis';

import { env } from '../config/env';
const globalForRedis = globalThis as typeof globalThis & {
  redis?: Redis;
};

export const redis = globalForRedis.redis ?? new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN,
});

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}