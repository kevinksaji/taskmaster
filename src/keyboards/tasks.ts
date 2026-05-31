import { Markup } from 'telegraf';

import { HubView } from '../types/navigation';
import { taskCompleteData } from '../utils/callback-data';
import { inlineKeyboard } from './common';
import { buildHubRow } from './navigation';

type TaskLike = {
  id: string;
  name: string;
  epic: { name: string };
};

export function buildTaskListKeyboard(tasks: TaskLike[], history: HubView[]) {
  return inlineKeyboard([
    buildHubRow('TASKS', history),
    ...tasks.map((task) => [
      Markup.button.callback(`${task.name} - ${task.epic.name}`, taskCompleteData(task.id, history)),
    ]),
  ]);
}
