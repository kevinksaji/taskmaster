import { navigationRepository } from '../repositories/navigationRepository';
import { BOT_OPERATION_KINDS, BotSession, DEFAULT_BOT_SESSION } from '../types/bot-state';

function parseStoredSession(record: Awaited<ReturnType<typeof navigationRepository.get>>): BotSession {
  if (!record || !record.itemMap || typeof record.itemMap !== 'object' || Array.isArray(record.itemMap)) {
    return DEFAULT_BOT_SESSION;
  }

  const candidate = record.itemMap as Record<string, unknown>;
  const started = Boolean(candidate.started);
  const taskNames = Array.isArray(candidate.taskNames)
    ? candidate.taskNames.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    : [];

  switch (record.currentView) {
    case BOT_OPERATION_KINDS.TASK_BATCH_PICK_EPIC:
      return { started, operation: { kind: BOT_OPERATION_KINDS.TASK_BATCH_PICK_EPIC, taskNames } };
    case BOT_OPERATION_KINDS.TASK_BATCH_CREATE_EPIC_NAME:
      return { started, operation: { kind: BOT_OPERATION_KINDS.TASK_BATCH_CREATE_EPIC_NAME, taskNames } };
    default:
      return { started, operation: { kind: BOT_OPERATION_KINDS.IDLE } };
  }
}

export const stateService = {
  async getSession(telegramUserId: string): Promise<BotSession> {
    const record = await navigationRepository.get(telegramUserId);
    return parseStoredSession(record);
  },

  async persistSession(telegramUserId: string, chatId: string, session: BotSession) {
    await navigationRepository.upsert({
      telegramUserId,
      chatId,
      currentView: session.operation.kind,
      history: [],
      itemMap: {
        started: session.started,
        taskNames: 'taskNames' in session.operation ? session.operation.taskNames : [],
      },
    });
  },

  async markStarted(telegramUserId: string, chatId: string) {
    const current = await this.getSession(telegramUserId);
    await this.persistSession(telegramUserId, chatId, {
      ...current,
      started: true,
    });
  },

  async startTaskBatch(telegramUserId: string, chatId: string, taskNames: string[]) {
    const current = await this.getSession(telegramUserId);
    await this.persistSession(telegramUserId, chatId, {
      started: current.started,
      operation: {
        kind: BOT_OPERATION_KINDS.TASK_BATCH_PICK_EPIC,
        taskNames,
      },
    });
  },

  async startTaskBatchEpicCreate(telegramUserId: string, chatId: string, taskNames: string[]) {
    const current = await this.getSession(telegramUserId);
    await this.persistSession(telegramUserId, chatId, {
      started: current.started,
      operation: {
        kind: BOT_OPERATION_KINDS.TASK_BATCH_CREATE_EPIC_NAME,
        taskNames,
      },
    });
  },

  async clearOperation(telegramUserId: string, chatId: string) {
    const current = await this.getSession(telegramUserId);
    await this.persistSession(telegramUserId, chatId, {
      started: current.started,
      operation: {
        kind: BOT_OPERATION_KINDS.IDLE,
      },
    });
  },
};