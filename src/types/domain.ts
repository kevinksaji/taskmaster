import { TaskStatus } from '@prisma/client';

export const taskFilters = ['all', 'todo', 'done', 'overdue', 'today'] as const;
export type TaskFilter = (typeof taskFilters)[number];

export function parseTaskFilter(input: string | null | undefined): TaskFilter {
  const normalized = input?.trim().toLowerCase();
  if (!normalized) {
    return 'all';
  }

  if (taskFilters.includes(normalized as TaskFilter)) {
    return normalized as TaskFilter;
  }

  return 'all';
}

export function normalizeTaskStatus(input: string): TaskStatus {
  return input.toUpperCase() === TaskStatus.DONE ? TaskStatus.DONE : TaskStatus.TODO;
}
