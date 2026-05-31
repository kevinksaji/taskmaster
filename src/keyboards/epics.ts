import { deleteEpicData } from '../utils/callback-data';
import { inlineKeyboard, toCallbackButton } from './common';
import { buildCancelRow } from './navigation';

type EpicLike = {
  id: string;
  name: string;
};

export function buildEpicDeleteKeyboard(epics: EpicLike[]) {
  return inlineKeyboard([
    ...epics.map((epic) => [toCallbackButton(epic.name, deleteEpicData(epic.id))]),
    buildCancelRow(),
  ]);
}