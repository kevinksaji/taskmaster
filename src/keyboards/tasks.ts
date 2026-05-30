import { TaskStatus } from '@prisma/client';
import { Markup } from 'telegraf';

import { TaskFilter } from '../types/domain';
import {
  taskListNavData,
  taskStatusData,
} from '../utils/callback-data';
import { paginate } from '../utils/pagination';
import { inlineKeyboard, paginationRow } from './common';

type TaskLike = {
  id: string;
  name: string;
  status: TaskStatus;
  epic: { name: string };
};

export function buildTaskListKeyboard(tasks: TaskLike[], filter: TaskFilter, page = 0) {
  const slice = paginate(tasks, page);
  const rows = slice.items.map((task) => [
    Markup.button.callback(`📝 ${task.name} - ${task.epic.name}`, `tv|${task.id}`),
  ]);

  if (slice.pageCount > 1) {
    rows.push(paginationRow(
      slice.page > 0 ? taskListNavData(filter, slice.page - 1) : null,
      slice.page < slice.pageCount - 1 ? taskListNavData(filter, slice.page + 1) : null,
      slice.page,
      slice.pageCount,
    ));
  }

  rows.push([Markup.button.callback('Create task', 'nt')]);

  return inlineKeyboard(rows);
}
export function buildTaskActionKeyboard(taskId: string, status: TaskStatus) {
  const actionButton = status === TaskStatus.DONE
    ? Markup.button.callback('Done', 'noop')
    : Markup.button.callback('Mark as done', taskStatusData(taskId, TaskStatus.DONE));

  return inlineKeyboard([
    [
      actionButton,
      Markup.button.callback('Delete', `tx|${taskId}`),
    ],
  ]);
}

export function buildTaskCreateKeyboard() {
  return inlineKeyboard([
    [Markup.button.callback('Create task', 'nt')],
  ]);
}
