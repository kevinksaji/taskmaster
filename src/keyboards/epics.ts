import { Markup } from 'telegraf';

import { paginate } from '../utils/pagination';
import { epicListNavData, epicSelectionData, epicSelectionNavData } from '../utils/callback-data';
import { cancelRow, inlineKeyboard, paginationRow } from './common';

type EpicLike = {
  id: string;
  name: string;
  _count?: { tasks: number };
};

export function buildEpicListKeyboard(epics: EpicLike[], page = 0) {
  const slice = paginate(epics, page);
  const rows = slice.items.flatMap((epic) => [
    [Markup.button.callback(`📘 ${epic.name}`, `ev|${epic.id}`)],
    [
      Markup.button.callback('Update', `eu|${epic.id}`),
      Markup.button.callback('Delete', `ed|${epic.id}`),
    ],
  ]);

  if (slice.pageCount > 1) {
    rows.push(paginationRow(
      slice.page > 0 ? epicListNavData(slice.page - 1) : null,
      slice.page < slice.pageCount - 1 ? epicListNavData(slice.page + 1) : null,
      slice.page,
      slice.pageCount,
    ));
  }

  return inlineKeyboard(rows);
}

export function buildEpicSelectionKeyboard(epics: EpicLike[], purpose: string, page = 0) {
  const slice = paginate(epics, page);
  const rows = slice.items.map((epic) => [
    Markup.button.callback(epic.name, epicSelectionData(purpose, epic.id)),
  ]);

  if (slice.pageCount > 1) {
    rows.push(paginationRow(
      slice.page > 0 ? epicSelectionNavData(purpose, slice.page - 1) : null,
      slice.page < slice.pageCount - 1 ? epicSelectionNavData(purpose, slice.page + 1) : null,
      slice.page,
      slice.pageCount,
    ));
  }

  rows.push(cancelRow());

  return inlineKeyboard(rows);
}

export function buildEpicActionKeyboard(epicId: string) {
  return inlineKeyboard([
    [
      Markup.button.callback('Update epic', `eu|${epicId}`),
      Markup.button.callback('Delete epic', `ed|${epicId}`),
    ],
    [
      Markup.button.callback('Create task in this epic', `tc|${epicId}`),
      Markup.button.callback('View tasks', `et|${epicId}`),
    ],
  ]);
}

export function buildEpicDeleteKeyboard(epicId: string, hasTasks: boolean) {
  if (hasTasks) {
    return inlineKeyboard([
      [Markup.button.callback('Cascade delete epic and tasks', `edf|${epicId}|cascade`)],
      [Markup.button.callback('Cancel', 'ca')],
    ]);
  }

  return inlineKeyboard([
    [Markup.button.callback('Yes, delete epic', `edf|${epicId}|delete`)],
    [Markup.button.callback('Cancel', 'ca')],
  ]);
}
