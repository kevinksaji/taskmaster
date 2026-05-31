import { epicRepository } from '../repositories/epicRepository';
import { taskRepository } from '../repositories/taskRepository';
import { UserFacingError } from '../utils/errors';

export const taskService = {
  listTasks(telegramUserId: string) {
    return taskRepository.listByUser(telegramUserId);
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
