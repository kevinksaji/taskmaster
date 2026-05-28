export const DEFAULT_PAGE_SIZE = 5;

export type PageSlice<T> = {
  items: T[];
  page: number;
  pageCount: number;
  totalCount: number;
};

export function paginate<T>(items: T[], page: number, pageSize = DEFAULT_PAGE_SIZE): PageSlice<T> {
  const safePage = Number.isFinite(page) && page >= 0 ? Math.floor(page) : 0;
  const totalCount = items.length;
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const boundedPage = Math.min(safePage, pageCount - 1);
  const start = boundedPage * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: boundedPage,
    pageCount,
    totalCount,
  };
}
