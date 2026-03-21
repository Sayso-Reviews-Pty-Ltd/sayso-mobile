export const ITEMS_PER_PAGE = 12;

export const BREAKPOINT_SM = 640;
export const BREAKPOINT_MD = 768;
export const BREAKPOINT_XL = 1280;

export const OFF_WHITE = '#E5E0E5';
export const CARD_BG = '#9DAB9B';
export const SAGE = '#7D9B76';
export const CHARCOAL = '#2D2D2D';

export interface FilterOption {
  value: string | null;
  label: string;
  count: number;
}

export type SavedBusinessRecord = {
  id: string;
  name: string;
  category?: string | null;
};

export function isNonEmptyString(value: string | null | undefined): value is string {
  return Boolean(value && value.trim().length > 0);
}

export function resolveGridColumns(width: number): number {
  if (width >= BREAKPOINT_XL) return 4;
  if (width >= BREAKPOINT_MD) return 3;
  if (width >= BREAKPOINT_SM) return 2;
  return 1;
}

export function getPageNumbers(currentPage: number, totalPages: number): Array<number | string> {
  const pages: Array<number | string> = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    for (let p = 1; p <= totalPages; p += 1) pages.push(p);
    return pages;
  }

  pages.push(1);
  if (currentPage > 3) pages.push('...');

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let p = start; p <= end; p += 1) pages.push(p);

  if (currentPage < totalPages - 2) pages.push('...');
  if (totalPages > 1) pages.push(totalPages);

  return pages;
}

export function chunkIntoRows<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}
