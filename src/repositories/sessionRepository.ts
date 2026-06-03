import { env } from '../config/env';
import { redis } from '../lib/redis';

type StoredOperationRecord = {
  kind: string;
  taskNames: string[];
};

const SESSION_KEY_PREFIX = 'user-session';

function getStartedKey(telegramUserId: string) {
  return `${SESSION_KEY_PREFIX}:${telegramUserId}:started`;
}

function getOperationKey(telegramUserId: string) {
  return `${SESSION_KEY_PREFIX}:${telegramUserId}:operation`;
}

function normalizeOperation(value: unknown): StoredOperationRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const taskNames = Array.isArray(candidate.taskNames)
    ? candidate.taskNames.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    : [];

  return {
    kind: typeof candidate.kind === 'string' ? candidate.kind : 'IDLE',
    taskNames,
  };
}

export const sessionRepository = {
  async getSessionState(telegramUserId: string) {
    const [startedValue, operationValue] = await Promise.all([
      redis.get<string>(getStartedKey(telegramUserId)),
      redis.get<StoredOperationRecord | string>(getOperationKey(telegramUserId)),
    ]);

    let operation: StoredOperationRecord | null = null;

    try {
      operation = typeof operationValue === 'string'
        ? normalizeOperation(JSON.parse(operationValue))
        : normalizeOperation(operationValue);
    } catch {
      operation = null;
    }

    return {
      started: startedValue === '1',
      operation,
    };
  },

  markStarted(telegramUserId: string) {
    return redis.set(getStartedKey(telegramUserId), '1');
  },

  setOperation(input: {
    telegramUserId: string;
    kind: string;
    taskNames: string[];
  }) {
    return redis.set(getOperationKey(input.telegramUserId), {
      kind: input.kind,
      taskNames: input.taskNames,
    }, {
      ex: env.SESSION_TTL_SECONDS,
    });
  },

  clearOperation(telegramUserId: string) {
    return redis.del(getOperationKey(telegramUserId));
  },
};