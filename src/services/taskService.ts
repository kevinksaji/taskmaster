import { epicRepository } from '../repositories/epicRepository';
import { taskRepository } from '../repositories/taskRepository';
import { UserFacingError } from '../utils/errors';

export const taskService = {
  listTasksForEpic(telegramUserId: string, epicId: string) {
    return taskRepository.listByEpic(epicId, telegramUserId);
  },

  async createTasks(input: { telegramUserId: string; epicId: string; names: string[] }) {
    await this.ensureEpicOwnership(input.telegramUserId, input.epicId);

    const names = input.names
      .map((name) => name.trim())
      .filter(Boolean);

    if (names.length === 0) {
      return [];
    }

    await taskRepository.createMany(
      names.map((name) => ({
        name,
        epicId: input.epicId,
        telegramUserId: input.telegramUserId,
      })),
    );

    return taskRepository.listByEpic(input.epicId, input.telegramUserId);
  },

  async getTaskOrThrow(telegramUserId: string, taskId: string) {
    const task = await taskRepository.findByIdForUser(taskId, telegramUserId);
    if (!task) {
      throw new UserFacingError('That task could not be found. It may have been deleted already.');
    }

    return task;
  },

  async ensureEpicOwnership(telegramUserId: string, epicId: string) {
    const epic = await epicRepository.findByIdForUser(epicId, telegramUserId);
    if (!epic) {
      throw new UserFacingError('Please choose one of your own epics.');
    }

    return epic;
  },

  async deleteTask(telegramUserId: string, taskId: string) {
    const task = await this.getTaskOrThrow(telegramUserId, taskId);
    await taskRepository.delete(taskId, telegramUserId);
    return task;
  },
};
