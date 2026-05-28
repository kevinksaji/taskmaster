import dayjs from 'dayjs';
import { Prisma, TaskStatus } from '@prisma/client';

import { prisma } from '../lib/prisma';
import { TaskFilter } from '../types/domain';

export type TaskWithEpic = Prisma.TaskGetPayload<{
  include: { epic: true };
}>;

function buildWhere(telegramUserId: string, filter: TaskFilter): Prisma.TaskWhereInput {
  const todayStart = dayjs().startOf('day').toDate();
  const todayEnd = dayjs().endOf('day').toDate();

  switch (filter) {
    case 'todo':
      return { telegramUserId, status: TaskStatus.TODO };
    case 'done':
      return { telegramUserId, status: TaskStatus.DONE };
    case 'overdue':
      return {
        telegramUserId,
        status: TaskStatus.TODO,
        dueDate: { lt: todayStart },
      };
    case 'today':
      return {
        telegramUserId,
        dueDate: { gte: todayStart, lte: todayEnd },
      };
    case 'all':
    default:
      return { telegramUserId };
  }
}

export const taskRepository = {
  listByUser(telegramUserId: string, filter: TaskFilter) {
    return prisma.task.findMany({
      where: buildWhere(telegramUserId, filter),
      include: { epic: true },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  },

  listByEpic(telegramUserId: string, epicId: string) {
    return prisma.task.findMany({
      where: { telegramUserId, epicId },
      include: { epic: true },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
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
    description: string | null;
    dueDate: Date | null;
    epicId: string;
    telegramUserId: string;
    status?: TaskStatus;
  }) {
    return prisma.task.create({
      data,
      include: { epic: true },
    });
  },

  update(id: string, telegramUserId: string, data: {
    name?: string;
    description?: string | null;
    dueDate?: Date | null;
    epicId?: string;
    status?: TaskStatus;
  }) {
    return prisma.task.updateMany({
      where: { id, telegramUserId },
      data,
    });
  },

  delete(id: string, telegramUserId: string) {
    return prisma.task.deleteMany({
      where: { id, telegramUserId },
    });
  },
};
