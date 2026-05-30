import { Markup } from 'telegraf';

import { withPrimaryNavigation } from './navigation';

export function buildEpicCreatedKeyboard(epicId: string) {
  return withPrimaryNavigation([
    [
      Markup.button.callback('View epic', `ev|${epicId}`),
      Markup.button.callback('Create task in this epic', `tc|${epicId}`),
    ],
    [Markup.button.callback('Create another epic', 'ne')],
  ], 'epics');
}

export function buildTaskCreatedKeyboard(taskId: string) {
  return withPrimaryNavigation([
    [
      Markup.button.callback('View task', `tv|${taskId}`),
      Markup.button.callback('Create another task', 'nt'),
    ],
  ], 'tasks');
}
