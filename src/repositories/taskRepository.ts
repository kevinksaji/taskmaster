import { Prisma } from '@prisma/client';

import { prisma } from '../lib/prisma';
import { TaskFilter } from '../types/domain';

export type TaskWithEpic = Prisma.TaskGetPayload<{
  include: { epic: true };
}>;

export const taskRepository = {
  listByUser(telegramUserId: string, _filter: TaskFilter) {
    return prisma.task.findMany({
      where: { telegramUserId },
      include: { epic: true },
      orderBy: [{ createdAt: 'desc' }],
    });
  },

  listByEpic(telegramUserId: string, epicId: string) {
    return prisma.task.findMany({
      where: { telegramUserId, epicId },
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

  create(data: {
    name: string;
    epicId: string;
    telegramUserId: string;
  }) {
    return prisma.task.create({
      data,
      include: { epic: true },
    });
  },

  delete(id: string, telegramUserId: string) {
    return prisma.task.deleteMany({
      where: { id, telegramUserId },
    });
  },
};
