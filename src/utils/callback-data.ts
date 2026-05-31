import { HUB_VIEWS, HubView } from '../types/navigation';

const VIEW_CODES: Record<HubView, string> = {
  [HUB_VIEWS.HOME]: 'h',
  [HUB_VIEWS.TASKS]: 't',
  [HUB_VIEWS.EPICS]: 'e',
};

const CODE_TO_VIEW = Object.fromEntries(
  Object.entries(VIEW_CODES).map(([view, code]) => [code, view]),
) as Record<string, HubView>;

// The hub is fully stateless on the server: the callback payload carries a tiny
// encoded history stack so Back can rebuild the previous screen after each tap.
export function encodeHistory(history: HubView[]) {
  return history.map((view) => VIEW_CODES[view]).join('');
}

export function decodeHistory(token: string | undefined) {
  if (!token) {
    return [] as HubView[];
  }

  return token
    .split('')
    .map((code) => CODE_TO_VIEW[code])
    .filter((view): view is HubView => Boolean(view));
}

export function decodeView(code: string | undefined) {
  return CODE_TO_VIEW[code ?? ''] ?? HUB_VIEWS.HOME;
}

export function navigateViewData(currentView: HubView, nextView: HubView, history: HubView[]) {
  const nextHistory = nextView === currentView ? history : [...history, currentView];
  return `hv|${VIEW_CODES[nextView]}|${encodeHistory(nextHistory)}`;
}

export function startViewData(nextView: Exclude<HubView, 'HOME'>) {
  return `hv|${VIEW_CODES[nextView]}|${encodeHistory([HUB_VIEWS.HOME])}`;
}

export function backData(history: HubView[]) {
  return `bk|${encodeHistory(history)}`;
}

export function taskCompleteData(taskId: string, history: HubView[]) {
  return `td|${taskId}|${encodeHistory(history)}`;
}

export function epicClearData(epicId: string, history: HubView[]) {
  return `ec|${epicId}|${encodeHistory(history)}`;
}
