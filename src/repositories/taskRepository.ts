import { prisma } from '../lib/prisma';

export const taskRepository = {
  listByEpic(epicId: string, telegramUserId: string) {
    return prisma.task.findMany({
      where: { epicId, telegramUserId },
      include: { epic: true },
      orderBy: [{ createdAt: 'desc' }],
    });
  },

  createMany(data: Array<{ name: string; epicId: string; telegramUserId: string }>) {
    return prisma.task.createMany({
      data,
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
