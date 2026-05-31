import { sessionRepository } from '../repositories/sessionRepository';
import { BOT_OPERATION_KINDS, BotSession, DEFAULT_BOT_SESSION } from '../types/bot-state';

function parseStoredSession(record: Awaited<ReturnType<typeof sessionRepository.get>>): BotSession {
  if (!record) {
    return DEFAULT_BOT_SESSION;
  }

  const candidate = record.sessionData && typeof record.sessionData === 'object' && !Array.isArray(record.sessionData)
    ? record.sessionData as Record<string, unknown>
    : {};
  const lastQuoteText = typeof candidate.lastQuoteText === 'string' && candidate.lastQuoteText.trim().length > 0
    ? candidate.lastQuoteText
    : null;

  const taskNames = Array.isArray(candidate.taskNames)
    ? candidate.taskNames.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    : [];

  switch (record.operationKind) {
    case BOT_OPERATION_KINDS.TASK_BATCH_PICK_EPIC:
      return { started: record.started, lastQuoteText, operation: { kind: BOT_OPERATION_KINDS.TASK_BATCH_PICK_EPIC, taskNames } };
    case BOT_OPERATION_KINDS.TASK_BATCH_CREATE_EPIC_NAME:
      return { started: record.started, lastQuoteText, operation: { kind: BOT_OPERATION_KINDS.TASK_BATCH_CREATE_EPIC_NAME, taskNames } };
    default:
      return { started: record.started, lastQuoteText, operation: { kind: BOT_OPERATION_KINDS.IDLE } };
  }
}

export const sessionService = {
  async getSession(telegramUserId: string): Promise<BotSession> {
    const record = await sessionRepository.get(telegramUserId);
    return parseStoredSession(record);
  },

  async persistSession(telegramUserId: string, session: BotSession) {
    await sessionRepository.upsert({
      telegramUserId,
      started: session.started,
      operationKind: session.operation.kind,
      sessionData: {
        lastQuoteText: session.lastQuoteText,
        taskNames: 'taskNames' in session.operation ? session.operation.taskNames : [],
      },
    });
  },

  async markStarted(telegramUserId: string) {
    const current = await this.getSession(telegramUserId);
    await this.persistSession(telegramUserId, {
      ...current,
      started: true,
    });
  },

  async startTaskBatch(telegramUserId: string, taskNames: string[]) {
    const current = await this.getSession(telegramUserId);
    await this.persistSession(telegramUserId, {
      started: current.started,
      lastQuoteText: current.lastQuoteText,
      operation: {
        kind: BOT_OPERATION_KINDS.TASK_BATCH_PICK_EPIC,
        taskNames,
      },
    });
  },

  async startTaskBatchEpicCreate(telegramUserId: string, taskNames: string[]) {
    const current = await this.getSession(telegramUserId);
    await this.persistSession(telegramUserId, {
      started: current.started,
      lastQuoteText: current.lastQuoteText,
      operation: {
        kind: BOT_OPERATION_KINDS.TASK_BATCH_CREATE_EPIC_NAME,
        taskNames,
      },
    });
  },

  async clearOperation(telegramUserId: string) {
    const current = await this.getSession(telegramUserId);
    await this.persistSession(telegramUserId, {
      started: current.started,
      lastQuoteText: current.lastQuoteText,
      operation: {
        kind: BOT_OPERATION_KINDS.IDLE,
      },
    });
  },
};