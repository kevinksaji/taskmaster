import { Prisma } from '@prisma/client';

import { epicRepository } from '../repositories/epicRepository';
import { UserFacingError } from '../utils/errors';
import { epicNameSchema } from '../utils/validation';

export const epicService = {
  listEpics(telegramUserId: string) {
    return epicRepository.listByUser(telegramUserId);
  },

  async getEpicOrThrow(telegramUserId: string, epicId: string) {
    const epic = await epicRepository.findByIdForUser(epicId, telegramUserId);
    if (!epic) {
      throw new UserFacingError('That epic could not be found. It may have been deleted already.');
    }

    return epic;
  },

  async getEpicDetails(telegramUserId: string, epicId: string) {
    const epic = await this.getEpicOrThrow(telegramUserId, epicId);
    const tasks = await epicRepository.listTasks(epicId, telegramUserId);

    return {
      epic,
      tasks,
      counts: {
        total: tasks.length,
      },
    };
  },

  async createEpic(input: { telegramUserId: string; name: string }) {
    const name = epicNameSchema.parse(input.name);

    try {
      return await epicRepository.create({
        telegramUserId: input.telegramUserId,
        name,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new UserFacingError('You already have an epic with that name. Please choose another name.');
      }

      throw error;
    }
  },
};
