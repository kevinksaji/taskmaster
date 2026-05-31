import { epicRepository } from '../repositories/epicRepository';
import { taskRepository } from '../repositories/taskRepository';
import { TaskFilter } from '../types/domain';
import { UserFacingError } from '../utils/errors';
import { taskNameSchema } from '../utils/validation';

export const taskService = {
  listTasks(telegramUserId: string, filter: TaskFilter) {
    return taskRepository.listByUser(telegramUserId, filter);
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

  async createTask(input: {
    telegramUserId: string;
    name: string;
    epicId: string;
  }) {
    const name = taskNameSchema.parse(input.name);
    await this.ensureEpicOwnership(input.telegramUserId, input.epicId);

    return taskRepository.create({
      telegramUserId: input.telegramUserId,
      name,
      epicId: input.epicId,
    });
  },

  async deleteTask(telegramUserId: string, taskId: string) {
    const task = await this.getTaskOrThrow(telegramUserId, taskId);
    await taskRepository.delete(taskId, telegramUserId);
    return task;
  },
};
