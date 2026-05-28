import { TaskStatus } from '@prisma/client';
import { Markup } from 'telegraf';

import { taskStatusData } from '../utils/callback-data';
import { inlineKeyboard } from './common';

export function buildEpicCreatedKeyboard(epicId: string) {
  return inlineKeyboard([
    [
      Markup.button.callback('View epic', `ev|${epicId}`),
      Markup.button.callback('Create task in this epic', `tc|${epicId}`),
    ],
    [Markup.button.callback('Create another epic', 'ne')],
  ]);
}

export function buildTaskCreatedKeyboard(taskId: string) {
  return inlineKeyboard([
    [
      Markup.button.callback('View task', `tv|${taskId}`),
      Markup.button.callback('Mark done', taskStatusData(taskId, TaskStatus.DONE)),
    ],
    [Markup.button.callback('Create another task', 'nt')],
  ]);
}

export function buildEpicUpdateFieldKeyboard() {
  return inlineKeyboard([
    [
      Markup.button.callback('Name', 'euf|name'),
      Markup.button.callback('Description', 'euf|description'),
    ],
    [Markup.button.callback('Cancel', 'ca')],
  ]);
}
