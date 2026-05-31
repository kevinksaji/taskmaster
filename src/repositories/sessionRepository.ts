import { Prisma } from '@prisma/client';

import { prisma } from '../lib/prisma';

export const sessionRepository = {
  get(telegramUserId: string) {
    return prisma.userSession.findUnique({
      where: { telegramUserId },
    });
  },

  upsert(input: {
    telegramUserId: string;
    started: boolean;
    operationKind: string;
    sessionData: Record<string, unknown>;
  }) {
    return prisma.userSession.upsert({
      where: { telegramUserId: input.telegramUserId },
      create: {
        telegramUserId: input.telegramUserId,
        started: input.started,
        operationKind: input.operationKind,
        sessionData: input.sessionData as Prisma.InputJsonValue,
      },
      update: {
        started: input.started,
        operationKind: input.operationKind,
        sessionData: input.sessionData as Prisma.InputJsonValue,
      },
    });
  },

  clear(telegramUserId: string) {
    return prisma.userSession.deleteMany({
      where: { telegramUserId },
    });
  },
};