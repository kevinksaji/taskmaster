import { sessionRepository } from '../repositories/sessionRepository';
import { BOT_OPERATION_KINDS, BotSession, DEFAULT_BOT_SESSION } from '../types/bot-state';

function parseStoredSession(record: Awaited<ReturnType<typeof sessionRepository.getSessionState>>): BotSession {
  if (!record.operation) {
    return DEFAULT_BOT_SESSION;
  }

  switch (record.operation.kind) {
    case BOT_OPERATION_KINDS.TASK_BATCH_PICK_EPIC:
      return { operation: { kind: BOT_OPERATION_KINDS.TASK_BATCH_PICK_EPIC, taskNames: record.operation.taskNames } };
    case BOT_OPERATION_KINDS.TASK_BATCH_CREATE_EPIC_NAME:
      return { operation: { kind: BOT_OPERATION_KINDS.TASK_BATCH_CREATE_EPIC_NAME, taskNames: record.operation.taskNames } };
    default:
      return DEFAULT_BOT_SESSION;
  }
}

export const sessionService = {
  async getSession(telegramUserId: string): Promise<BotSession> {
    const record = await sessionRepository.getSessionState(telegramUserId);
    return parseStoredSession(record);
  },

  async startTaskBatch(telegramUserId: string, taskNames: string[]) {
    await sessionRepository.setOperation({
      telegramUserId,
      kind: BOT_OPERATION_KINDS.TASK_BATCH_PICK_EPIC,
      taskNames,
    });
  },

  async startTaskBatchEpicCreate(telegramUserId: string, taskNames: string[]) {
    await sessionRepository.setOperation({
      telegramUserId,
      kind: BOT_OPERATION_KINDS.TASK_BATCH_CREATE_EPIC_NAME,
      taskNames,
    });
  },

  async clearOperation(telegramUserId: string) {
    await sessionRepository.clearOperation(telegramUserId);
  },
};