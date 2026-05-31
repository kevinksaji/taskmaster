import { TaskFilter } from '../types/domain';

export const EPIC_PURPOSE = {
  TASK_CREATE: 'tce',
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
