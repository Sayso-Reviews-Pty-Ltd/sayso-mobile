import {
  ITEMS_PER_PAGE,
  type FilterOption,
  type SavedBusinessRecord,
  getPageNumbers,
  chunkIntoRows,
  isNonEmptyString,
} from '../saved-screen/savedScreenTokens';

export { ITEMS_PER_PAGE, getPageNumbers, chunkIntoRows, isNonEmptyString };
export type { FilterOption, SavedBusinessRecord };

export function buildSavedCategories(savedBusinesses: SavedBusinessRecord[]): string[] {
  const unique = Array.from(
    new Set(savedBusinesses.map((business) => business.category).filter(isNonEmptyString))
  ).sort((categoryA, categoryB) => categoryA.localeCompare(categoryB));
  return ['All', ...unique];
}

export function filterSavedBusinesses(
  savedBusinesses: SavedBusinessRecord[],
  selectedCategory: string | null
): SavedBusinessRecord[] {
  if (!selectedCategory || selectedCategory === 'All') {
    return savedBusinesses;
  }
  return savedBusinesses.filter((business) => business.category === selectedCategory);
}

export function buildSavedFilterOptions(
  categories: string[],
  savedBusinesses: SavedBusinessRecord[]
): FilterOption[] {
  return categories.map((category) => ({
    value: category === 'All' ? null : category,
    label: category,
    count:
      category === 'All'
        ? savedBusinesses.length
        : savedBusinesses.filter((business) => business.category === category).length,
  }));
}

export function getPaginatedSavedItems(
  businesses: SavedBusinessRecord[],
  currentPage: number,
  itemsPerPage: number = ITEMS_PER_PAGE
): SavedBusinessRecord[] {
  const start = (currentPage - 1) * itemsPerPage;
  return businesses.slice(start, start + itemsPerPage);
}
