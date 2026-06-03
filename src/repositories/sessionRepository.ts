import { env } from '../config/env';
import { redis } from '../lib/redis';

type StoredSessionRecord = {
  started: boolean;
  operationKind: string;
  sessionData: Record<string, unknown>;
};

const SESSION_KEY_PREFIX = 'user-session';

function getSessionKey(telegramUserId: string) {
  return `${SESSION_KEY_PREFIX}:${telegramUserId}`;
}

function normalizeRecord(value: unknown): StoredSessionRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const sessionData = candidate.sessionData && typeof candidate.sessionData === 'object' && !Array.isArray(candidate.sessionData)
    ? candidate.sessionData as Record<string, unknown>
    : {};

  return {
    started: candidate.started === true,
    operationKind: typeof candidate.operationKind === 'string' ? candidate.operationKind : 'IDLE',
    sessionData,
  };
}

export const sessionRepository = {
  async get(telegramUserId: string) {
    const stored = await redis.get(getSessionKey(telegramUserId));
    if (!stored) {
      return null;
    }

    try {
      return normalizeRecord(JSON.parse(stored));
    } catch {
      return null;
    }
  },

  async upsert(input: {
    telegramUserId: string;
    started: boolean;
    operationKind: string;
    sessionData: Record<string, unknown>;
  }) {
    const payload: StoredSessionRecord = {
      started: input.started,
      operationKind: input.operationKind,
      sessionData: input.sessionData,
    };

    await redis.set(getSessionKey(input.telegramUserId), JSON.stringify(payload), {
      EX: env.SESSION_TTL_SECONDS,
    });

    return {
      telegramUserId: input.telegramUserId,
      ...payload,
    };
  },

  clear(telegramUserId: string) {
    return redis.del(getSessionKey(telegramUserId));
  },
};