import { TaskStatus } from '@prisma/client';

import { TaskFilter } from '../types/domain';

export const EPIC_PURPOSE = {
  VIEW: 'evs',
  UPDATE: 'eus',
  DELETE: 'eds',
  TASK_CREATE: 'tce',
  TASK_UPDATE: 'tue',
} as const;

export const TASK_PURPOSE = {
  VIEW: 'tvs',
  UPDATE: 'tus',
  DELETE: 'tds',
  DONE: 'tdo',
  UNDONE: 'tun',
} as const;

export function epicSelectionData(purpose: string, epicId: string) {
  return `es|${purpose}|${epicId}`;
}

export function epicSelectionNavData(purpose: string, page: number) {
  return `en|${purpose}|${page}`;
}

export function taskSelectionData(purpose: string, taskId: string) {
  return `ts|${purpose}|${taskId}`;
}

export function taskSelectionNavData(purpose: string, filter: TaskFilter, page: number) {
  return `tp|${purpose}|${filter}|${page}`;
}

export function epicListNavData(page: number) {
  return `el|${page}`;
}

export function taskListNavData(filter: TaskFilter, page: number) {
  return `tl|${filter}|${page}`;
}

export function taskFilterShortcutData(purpose: string, filter: TaskFilter) {
  return `tf|${purpose}|${filter}`;
}

export function taskStatusData(taskId: string, status: TaskStatus) {
  return `tt|${taskId}|${status}`;
}
