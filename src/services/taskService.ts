import { TaskStatus } from '@prisma/client';

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
    dueDate: Date | null;
    epicId: string;
  }) {
    const name = taskNameSchema.parse(input.name);
    await this.ensureEpicOwnership(input.telegramUserId, input.epicId);

    return taskRepository.create({
      telegramUserId: input.telegramUserId,
      name,
      dueDate: input.dueDate,
      epicId: input.epicId,
      status: TaskStatus.TODO,
    });
  },

  async updateTask(input: {
    telegramUserId: string;
    taskId: string;
    name?: string;
    dueDate?: Date | null;
    epicId?: string;
    status?: TaskStatus;
  }) {
    await this.getTaskOrThrow(input.telegramUserId, input.taskId);

    if (input.epicId) {
      await this.ensureEpicOwnership(input.telegramUserId, input.epicId);
    }

    const data: {
      name?: string;
      dueDate?: Date | null;
      epicId?: string;
      status?: TaskStatus;
    } = {};

    if (typeof input.name === 'string') {
      data.name = taskNameSchema.parse(input.name);
    }

    if (Object.prototype.hasOwnProperty.call(input, 'dueDate')) {
      data.dueDate = input.dueDate ?? null;
    }

    if (input.epicId) {
      data.epicId = input.epicId;
    }

    if (input.status) {
      data.status = input.status;
    }

    await taskRepository.update(input.taskId, input.telegramUserId, data);
    return this.getTaskOrThrow(input.telegramUserId, input.taskId);
  },

  async deleteTask(telegramUserId: string, taskId: string) {
    const task = await this.getTaskOrThrow(telegramUserId, taskId);
    await taskRepository.delete(taskId, telegramUserId);
    return task;
  },

  async setTaskStatus(telegramUserId: string, taskId: string, status: TaskStatus) {
    await taskRepository.update(taskId, telegramUserId, { status });
    return this.getTaskOrThrow(telegramUserId, taskId);
  },
};
