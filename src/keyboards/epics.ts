import { Markup } from 'telegraf';

import { HubView } from '../types/navigation';
import { epicClearData } from '../utils/callback-data';
import { inlineKeyboard } from './common';
import { buildHubRow } from './navigation';

type EpicLike = {
  id: string;
  name: string;
  _count?: { tasks: number };
};

export function buildEpicListKeyboard(epics: EpicLike[], history: HubView[]) {
  return inlineKeyboard([
    buildHubRow('EPICS', history),
    ...epics.map((epic) => [Markup.button.callback(epic.name, epicClearData(epic.id, history))]),
  ]);
}
