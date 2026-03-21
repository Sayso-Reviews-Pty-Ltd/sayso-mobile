import {
  buildSavedCategories,
  buildSavedFilterOptions,
  filterSavedBusinesses,
  getPaginatedSavedItems,
} from '../../../screens/tabs/saved/helpers';

describe('saved/helpers', () => {
  const businesses = [
    { id: '1', name: 'A', category: 'Cafes' },
    { id: '2', name: 'B', category: 'Restaurants' },
    { id: '3', name: 'C', category: 'Cafes' },
    { id: '4', name: 'D', category: null },
    { id: '5', name: 'E', category: '  ' },
  ];

  it('builds sorted category list prefixed with All', () => {
    expect(buildSavedCategories(businesses as any)).toEqual(['All', 'Cafes', 'Restaurants']);
  });

  it('filters businesses by selected category', () => {
    expect(filterSavedBusinesses(businesses as any, 'Cafes')).toHaveLength(2);
    expect(filterSavedBusinesses(businesses as any, null)).toHaveLength(5);
  });

  it('builds filter options with counts', () => {
    const categories = buildSavedCategories(businesses as any);
    const options = buildSavedFilterOptions(categories, businesses as any);

    expect(options.find((option) => option.label === 'All')?.count).toBe(5);
    expect(options.find((option) => option.label === 'Cafes')?.count).toBe(2);
    expect(options.find((option) => option.label === 'Restaurants')?.count).toBe(1);
  });

  it('paginates saved businesses by page and page size', () => {
    const pageOne = getPaginatedSavedItems(businesses as any, 1, 2);
    const pageTwo = getPaginatedSavedItems(businesses as any, 2, 2);

    expect(pageOne.map((item) => item.id)).toEqual(['1', '2']);
    expect(pageTwo.map((item) => item.id)).toEqual(['3', '4']);
  });
});
