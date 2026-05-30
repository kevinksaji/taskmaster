import { Markup } from 'telegraf';

import { TaskFilter, taskFilters } from '../types/domain';
import {
  taskFilterShortcutData,
  taskListNavData,
  taskSelectionData,
  taskSelectionNavData,
} from '../utils/callback-data';
import { paginate } from '../utils/pagination';
import { cancelRow, inlineKeyboard, paginationRow } from './common';
import { withPrimaryNavigation } from './navigation';

type TaskLike = {
  id: string;
  name: string;
  epic: { name: string };
};

export function buildTaskListKeyboard(tasks: TaskLike[], filter: TaskFilter, page = 0) {
  const slice = paginate(tasks, page);
  const rows = slice.items.flatMap((task) => [
    [Markup.button.callback(`📝 ${task.name} — ${task.epic.name}`, `tv|${task.id}`)],
    [Markup.button.callback('Delete', `tx|${task.id}`)],
  ]);

  if (slice.pageCount > 1) {
    rows.push(paginationRow(
      slice.page > 0 ? taskListNavData(filter, slice.page - 1) : null,
      slice.page < slice.pageCount - 1 ? taskListNavData(filter, slice.page + 1) : null,
      slice.page,
      slice.pageCount,
    ));
  }

  return withPrimaryNavigation(rows, 'tasks');
}

export function buildTaskSelectionKeyboard(tasks: TaskLike[], purpose: string, filter: TaskFilter, page = 0) {
  const slice = paginate(tasks, page);
  const filterRow = taskFilters.map((value) => Markup.button.callback(labelForFilter(value), taskFilterShortcutData(purpose, value)));
  const rows = [filterRow];

  rows.push(...slice.items.map((task) => [
    Markup.button.callback(`${task.name} — ${task.epic.name}`, taskSelectionData(purpose, task.id)),
  ]));

  if (slice.pageCount > 1) {
    rows.push(paginationRow(
      slice.page > 0 ? taskSelectionNavData(purpose, filter, slice.page - 1) : null,
      slice.page < slice.pageCount - 1 ? taskSelectionNavData(purpose, filter, slice.page + 1) : null,
      slice.page,
      slice.pageCount,
    ));
  }

  rows.push(cancelRow());

  return withPrimaryNavigation(rows, 'tasks');
}

export function buildTaskActionKeyboard(taskId: string, epicId: string) {
  return withPrimaryNavigation([
    [
      Markup.button.callback('Delete task', `tx|${taskId}`),
      Markup.button.callback('View epic', `ev|${epicId}`),
    ],
  ], 'tasks');
}

export function buildTaskUpdateFieldKeyboard() {
  return inlineKeyboard([
    [
      Markup.button.callback('Name', 'tuf|name'),
      Markup.button.callback('Epic', 'tuf|epic'),
    ],
    [Markup.button.callback('Due date', 'tuf|dueDate')],
    [Markup.button.callback('Status', 'tuf|status')],
    cancelRow(),
  ]);
}

export function buildStatusChoiceKeyboard() {
  return inlineKeyboard([
    [
      Markup.button.callback('Todo', 'tus|TODO'),
      Markup.button.callback('Done', 'tus|DONE'),
    ],
    cancelRow(),
  ]);
}

function labelForFilter(filter: TaskFilter) {
  switch (filter) {
    case 'todo':
      return 'Todo';
    case 'done':
      return 'Done';
    case 'overdue':
      return 'Overdue';
    case 'today':
      return 'Today';
    case 'all':
    default:
      return 'All';
  }
}
