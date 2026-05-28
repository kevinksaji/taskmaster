import { Prisma } from '@prisma/client';

import { prisma } from '../lib/prisma';
import { ConversationStateValue } from '../types/conversation';

export const conversationRepository = {
  get(telegramUserId: string) {
    return prisma.conversationState.findUnique({
      where: { telegramUserId },
    });
  },

  async upsert(telegramUserId: string, chatId: string, state: ConversationStateValue) {
    return prisma.conversationState.upsert({
      where: { telegramUserId },
      create: {
        telegramUserId,
        chatId,
        flow: state.flow,
        step: state.step,
        payload: state.payload as Prisma.InputJsonValue,
      },
      update: {
        chatId,
        flow: state.flow,
        step: state.step,
        payload: state.payload as Prisma.InputJsonValue,
      },
    });
  },

  clear(telegramUserId: string) {
    return prisma.conversationState.deleteMany({
      where: { telegramUserId },
    });
  },
};
