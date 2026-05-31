import { epicRepository } from '../repositories/epicRepository';
import { UserFacingError } from '../utils/errors';

export const epicService = {
  listEpics(telegramUserId: string) {
    return epicRepository.listByUser(telegramUserId);
  },

  createEpic(input: { telegramUserId: string; name: string }) {
    return epicRepository.create(input);
  },

  async createEpics(input: { telegramUserId: string; names: string[] }) {
    const created = [];
    const skipped = [];

    for (const rawName of input.names) {
      const name = rawName.trim();
      if (!name) {
        continue;
      }

      const existing = await epicRepository.findByNameForUser(name, input.telegramUserId);
      if (existing) {
        skipped.push(name);
        continue;
      }

      created.push(await epicRepository.create({
        telegramUserId: input.telegramUserId,
        name,
      }));
    }

    return { created, skipped };
  },

  listEpicTasks(telegramUserId: string, epicId: string) {
    return epicRepository.listTasks(epicId, telegramUserId);
  },

  async getEpicOrThrow(telegramUserId: string, epicId: string) {
    const epic = await epicRepository.findByIdForUser(epicId, telegramUserId);
    if (!epic) {
      throw new UserFacingError('That epic could not be found. It may have been deleted already.');
    }

    return epic;
  },

  async deleteEpic(telegramUserId: string, epicId: string) {
    const epic = await this.getEpicOrThrow(telegramUserId, epicId);
    await epicRepository.delete(epicId, telegramUserId);
    return epic;
  },
};
