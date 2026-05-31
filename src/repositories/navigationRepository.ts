import { Prisma } from '@prisma/client';

import { prisma } from '../lib/prisma';

export const navigationRepository = {
  get(telegramUserId: string) {
    return prisma.navigationState.findUnique({
      where: { telegramUserId },
    });
  },

  upsert(input: {
    telegramUserId: string;
    chatId: string;
    currentView: string;
    history: string[];
    itemMap: Record<string, unknown>;
  }) {
    return prisma.navigationState.upsert({
      where: { telegramUserId: input.telegramUserId },
      create: {
        telegramUserId: input.telegramUserId,
        chatId: input.chatId,
        currentView: input.currentView,
        history: input.history as Prisma.InputJsonValue,
        itemMap: input.itemMap as Prisma.InputJsonValue,
      },
      update: {
        chatId: input.chatId,
        currentView: input.currentView,
        history: input.history as Prisma.InputJsonValue,
        itemMap: input.itemMap as Prisma.InputJsonValue,
      },
    });
  },

  clear(telegramUserId: string) {
    return prisma.navigationState.deleteMany({
      where: { telegramUserId },
    });
  },
};