import { MAX, SUBCATEGORY_MAP } from './constants';
import type { PreferencesResponseDto, VisibleSubcategoryGroup } from './types';

export function parseStoredIds(raw: string | null): string[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function filterKnownInterestIds(ids: string[]): string[] {
  return ids.filter((id) => Boolean(SUBCATEGORY_MAP[id]));
}

export function toVisibleGroups(interestIds: string[]): VisibleSubcategoryGroup[] {
  return interestIds
    .filter((id) => Boolean(SUBCATEGORY_MAP[id]))
    .map((id) => ({ interestId: id, ...SUBCATEGORY_MAP[id] }));
}

export function normalizePreferencesFromApi(preferences: PreferencesResponseDto) {
  const apiInterestIds = filterKnownInterestIds((preferences.interests ?? []).map((item) => item.id));
  const apiSubcategories = (preferences.subcategories ?? [])
    .map((item) => item.id)
    .filter((id) => id.length > 0);

  return {
    apiInterestIds,
    apiSubcategories,
  };
}

export function buildHelperText(selectedCount: number): string {
  if (selectedCount === 0) {
    return 'Select at least one subcategory to continue';
  }
  if (selectedCount === MAX) {
    return "Perfect! You've selected the maximum";
  }
  return 'Great! Select more or continue';
}
