import { Markup } from 'telegraf';
import { ReplyKeyboardMarkup } from 'telegraf/types';

import { inlineKeyboard } from './common';

export const PRIMARY_NAVIGATION_LABELS = {
  TASKS: 'Tasks',
  EPICS: 'Epics',
} as const;

export function buildPrimaryNavigationKeyboard(): ReplyKeyboardMarkup {
  return {
    keyboard: [[
      { text: PRIMARY_NAVIGATION_LABELS.TASKS },
      { text: PRIMARY_NAVIGATION_LABELS.EPICS },
    ]],
    resize_keyboard: true,
    is_persistent: true,
    input_field_placeholder: 'Choose Tasks or Epics',
  };
}

export function buildTaskHubKeyboard() {
  return inlineKeyboard([
    [
      Markup.button.callback('View all tasks', 'nh|tasks|list'),
      Markup.button.callback('Create task', 'nh|tasks|create'),
    ],
    [
      Markup.button.callback('Update task', 'nh|tasks|update'),
      Markup.button.callback('Delete task', 'nh|tasks|delete'),
    ],
    [
      Markup.button.callback('Mark done', 'nh|tasks|done'),
      Markup.button.callback('Mark todo', 'nh|tasks|undone'),
    ],
  ]);
}

export function buildEpicHubKeyboard() {
  return inlineKeyboard([
    [
      Markup.button.callback('View all epics', 'nh|epics|list'),
      Markup.button.callback('Create epic', 'nh|epics|create'),
    ],
    [
      Markup.button.callback('Update epic', 'nh|epics|update'),
      Markup.button.callback('Delete epic', 'nh|epics|delete'),
    ],
  ]);
}
