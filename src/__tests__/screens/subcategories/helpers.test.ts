import {
  buildHelperText,
  filterKnownInterestIds,
  normalizePreferencesFromApi,
  parseStoredIds,
  toVisibleGroups,
} from '../../../screens/stack/subcategories/helpers';

describe('subcategories/helpers', () => {
  it('parses stored ids safely', () => {
    expect(parseStoredIds('["food-drink"]')).toEqual(['food-drink']);
    expect(parseStoredIds('invalid-json')).toEqual([]);
    expect(parseStoredIds(null)).toEqual([]);
  });

  it('filters unknown interest ids', () => {
    expect(filterKnownInterestIds(['food-drink', 'unknown', 'travel'])).toEqual([
      'food-drink',
      'travel',
    ]);
  });

  it('maps interests to visible groups', () => {
    const groups = toVisibleGroups(['food-drink']);
    expect(groups).toHaveLength(1);
    expect(groups[0].groupLabel).toBe('Food & Drink');
    expect(groups[0].items.length).toBeGreaterThan(0);
  });

  it('normalizes preferences payload from api', () => {
    const normalized = normalizePreferencesFromApi({
      interests: [{ id: 'food-drink' }, { id: 'unknown' }],
      subcategories: [{ id: 'restaurants' }, { id: '' }],
    });

    expect(normalized.apiInterestIds).toEqual(['food-drink']);
    expect(normalized.apiSubcategories).toEqual(['restaurants']);
  });

  it('builds helper text by selected count', () => {
    expect(buildHelperText(0)).toContain('at least one');
    expect(buildHelperText(10)).toContain('maximum');
    expect(buildHelperText(3)).toContain('Great');
  });
});
