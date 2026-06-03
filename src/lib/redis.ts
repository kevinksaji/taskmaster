import { createClient } from 'redis';

import { env } from '../config/env';
import { logger } from '../utils/logger';

type RedisClient = ReturnType<typeof createClient>;

const globalForRedis = globalThis as typeof globalThis & {
  redis?: RedisClient;
  redisConnectPromise?: Promise<RedisClient>;
};

function createRedisClient() {
  const client = createClient({
    url: env.REDIS_URL,
  });

  client.on('error', (error) => {
    logger.error('redis.client.error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  });

  return client;
}

const client = globalForRedis.redis ?? createRedisClient();

async function ensureRedisConnection(): Promise<RedisClient> {
  if (client.isOpen) {
    return client;
  }

  if (!globalForRedis.redisConnectPromise) {
    globalForRedis.redisConnectPromise = client.connect()
      .then(() => client)
      .catch((error) => {
        globalForRedis.redisConnectPromise = undefined;
        throw error;
      });
  }

  return globalForRedis.redisConnectPromise;
}

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = client;
}

export const redis = {
  async get(key: string) {
    const connection = await ensureRedisConnection();
    return connection.get(key);
  },

  async set(key: string, value: string, options?: { EX?: number }) {
    const connection = await ensureRedisConnection();
    return connection.set(key, value, options);
  },

  async del(key: string) {
    const connection = await ensureRedisConnection();
    return connection.del(key);
  },
};