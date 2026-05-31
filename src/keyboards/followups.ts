import { Markup } from 'telegraf';

import { inlineKeyboard } from './common';

export function buildEpicCreatedKeyboard(epicId: string) {
  return inlineKeyboard([
    [
      Markup.button.callback('View tasks in epic', `et|${epicId}`),
      Markup.button.callback('Create task in this epic', `tc|${epicId}`),
    ],
    [Markup.button.callback('Create another epic', 'ne')],
  ]);
}

export function buildTaskCreatedKeyboard(taskId: string) {
  return inlineKeyboard([
    [
      Markup.button.callback('View task', `tv|${taskId}`),
      Markup.button.callback('Create another task', 'nt'),
    ],
  ]);
}
