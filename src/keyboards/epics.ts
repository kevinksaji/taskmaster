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
    [Markup.button.callback(`📘 ${epic.name}`, `et|${epic.id}`)],
    [Markup.button.callback('Delete', `ed|${epic.id}`)],
  ]);

  if (slice.pageCount > 1) {
    rows.push(paginationRow(
      slice.page > 0 ? epicListNavData(slice.page - 1) : null,
      slice.page < slice.pageCount - 1 ? epicListNavData(slice.page + 1) : null,
      slice.page,
      slice.pageCount,
    ));
  }

  rows.push([Markup.button.callback('Create epic', 'ne')]);

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

export function buildEpicCreateKeyboard() {
  return inlineKeyboard([
    [Markup.button.callback('Create epic', 'ne')],
  ]);
}
