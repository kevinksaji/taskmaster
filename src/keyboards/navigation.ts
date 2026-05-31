import { Markup } from 'telegraf';

import { HUB_VIEWS, HubView } from '../types/navigation';
import { backData, navigateViewData, startViewData } from '../utils/callback-data';
import { inlineKeyboard } from './common';

export function buildStartKeyboard() {
  return inlineKeyboard([[
    Markup.button.callback('Tasks', startViewData(HUB_VIEWS.TASKS)),
    Markup.button.callback('Epics', startViewData(HUB_VIEWS.EPICS)),
  ]]);
}

export function buildHubRow(currentView: HubView, history: HubView[]) {
  return [
    Markup.button.callback('Tasks', navigateViewData(currentView, HUB_VIEWS.TASKS, history)),
    Markup.button.callback('Epics', navigateViewData(currentView, HUB_VIEWS.EPICS, history)),
    Markup.button.callback('Back', backData(history)),
  ];
}
