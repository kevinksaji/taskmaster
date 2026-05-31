import { prisma } from '../lib/prisma';

export const epicRepository = {
  listByUser(telegramUserId: string) {
    return prisma.epic.findMany({
      where: { telegramUserId },
      include: { _count: { select: { tasks: true } } },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });
  },

  findByIdForUser(id: string, telegramUserId: string) {
    return prisma.epic.findFirst({
      where: { id, telegramUserId },
      include: { _count: { select: { tasks: true } } },
    });
  },

  findByNameForUser(name: string, telegramUserId: string) {
    return prisma.epic.findFirst({
      where: {
        telegramUserId,
        name,
      },
    });
  },

  create(data: { telegramUserId: string; name: string }) {
    return prisma.epic.create({
      data,
      include: { _count: { select: { tasks: true } } },
    });
  },

  delete(id: string, telegramUserId: string) {
    return prisma.epic.deleteMany({
      where: { id, telegramUserId },
    });
  },
};
