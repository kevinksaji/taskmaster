export const taskFilters = ['all'] as const;
export type TaskFilter = (typeof taskFilters)[number];

export function parseTaskFilter(input: string | null | undefined): TaskFilter {
  return 'all';
}
