import { Prisma } from '@prisma/client';

import { prisma } from '../lib/prisma';

export type TaskWithEpic = Prisma.TaskGetPayload<{
  include: { epic: true };
}>;

export const taskRepository = {
  listByUser(telegramUserId: string) {
    return prisma.task.findMany({
      where: { telegramUserId },
      include: { epic: true },
      orderBy: [{ createdAt: 'desc' }],
    });
  },

  findByIdForUser(id: string, telegramUserId: string) {
    return prisma.task.findFirst({
      where: { id, telegramUserId },
      include: { epic: true },
    });
  },

  delete(id: string, telegramUserId: string) {
    return prisma.task.deleteMany({
      where: { id, telegramUserId },
    });
  },
};
