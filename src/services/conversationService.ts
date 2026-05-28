import { conversationRepository } from '../repositories/conversationRepository';
import { ConversationStateValue, FlowType } from '../types/conversation';

export const conversationService = {
  async getActiveState(telegramUserId: string): Promise<ConversationStateValue | null> {
    const record = await conversationRepository.get(telegramUserId);
    if (!record) {
      return null;
    }

    return {
      flow: record.flow as FlowType,
      step: record.step,
      payload: (record.payload as Record<string, unknown> | null) ?? {},
    };
  },

  startFlow(telegramUserId: string, chatId: string, flow: FlowType, step: string, payload: Record<string, unknown> = {}) {
    return conversationRepository.upsert(telegramUserId, chatId, {
      flow,
      step,
      payload,
    });
  },

  updateFlow(telegramUserId: string, chatId: string, state: ConversationStateValue) {
    return conversationRepository.upsert(telegramUserId, chatId, state);
  },

  clearFlow(telegramUserId: string) {
    return conversationRepository.clear(telegramUserId);
  },
};
