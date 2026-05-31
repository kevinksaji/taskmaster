import { epicRepository } from '../repositories/epicRepository';
import { UserFacingError } from '../utils/errors';

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

  async deleteEpic(telegramUserId: string, epicId: string) {
    const epic = await this.getEpicOrThrow(telegramUserId, epicId);
    await epicRepository.delete(epicId, telegramUserId);
    return epic;
  },
};
