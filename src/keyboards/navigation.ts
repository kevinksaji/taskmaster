import { Markup } from 'telegraf';

import { inlineKeyboard } from './common';

type CallbackMarkupButton = ReturnType<typeof Markup.button.callback>;

export const PRIMARY_NAVIGATION_LABELS = {
  TASKS: 'Tasks',
  EPICS: 'Epics',
} as const;

export function buildPrimaryNavigationKeyboard(section?: 'tasks' | 'epics') {
  return inlineKeyboard([buildPrimaryNavigationRow(section)]);
}

export function withPrimaryNavigation(rows: CallbackMarkupButton[][], section?: 'tasks' | 'epics') {
  return inlineKeyboard([buildPrimaryNavigationRow(section), ...rows]);
}

export function buildTaskHubKeyboard() {
  return withPrimaryNavigation([
    [
      Markup.button.callback('View all tasks', 'nh|tasks|list'),
      Markup.button.callback('Create task', 'nh|tasks|create'),
    ],
    [Markup.button.callback('Delete task', 'nh|tasks|delete')],
  ], 'tasks');
}

export function buildEpicHubKeyboard() {
  return withPrimaryNavigation([
    [
      Markup.button.callback('View all epics', 'nh|epics|list'),
      Markup.button.callback('Create epic', 'nh|epics|create'),
    ],
    [Markup.button.callback('Delete epic', 'nh|epics|delete')],
  ], 'epics');
}

function buildPrimaryNavigationRow(section?: 'tasks' | 'epics') {
  return [
    buildNavigationButton(PRIMARY_NAVIGATION_LABELS.TASKS, 'tasks', section),
    buildNavigationButton(PRIMARY_NAVIGATION_LABELS.EPICS, 'epics', section),
  ];
}

function buildNavigationButton(label: string, target: 'tasks' | 'epics', section?: 'tasks' | 'epics') {
  const renderedLabel = section === target ? `• ${label}` : label;
  return Markup.button.callback(renderedLabel, `nh|${target}|hub`);
}
