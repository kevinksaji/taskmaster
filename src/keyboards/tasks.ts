import { Markup } from 'telegraf';

import { TaskFilter } from '../types/domain';
import { taskListNavData } from '../utils/callback-data';
import { paginate } from '../utils/pagination';
import { inlineKeyboard, paginationRow } from './common';

type TaskLike = {
  id: string;
  name: string;
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

export function buildTaskActionKeyboard(taskId: string) {
  return inlineKeyboard([
    [Markup.button.callback('Complete', `tx|${taskId}`)],
  ]);
}

export function buildTaskCreateKeyboard() {
  return inlineKeyboard([
    [Markup.button.callback('Create task', 'nt')],
  ]);
}
