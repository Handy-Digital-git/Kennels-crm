export const PAGE_SIZE = 10;

export function getCurrentPage(value?: string | string[]) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(rawValue ?? "1", 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

export function paginateItems<T>(items: T[], currentPage: number, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;

  return {
    currentPage: safePage,
    totalPages,
    pageItems: items.slice(startIndex, startIndex + pageSize),
    startItem: items.length === 0 ? 0 : startIndex + 1,
    endItem: Math.min(startIndex + pageSize, items.length),
    totalItems: items.length,
  };
}