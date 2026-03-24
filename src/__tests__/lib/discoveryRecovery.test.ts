import {
  getNextDistanceTier,
  resolveDiscoveryZeroResults,
} from '../../lib/discoveryRecovery';

describe('resolveDiscoveryZeroResults', () => {
  it('returns clear search for query-only zero results', () => {
    const result = resolveDiscoveryZeroResults({ query: 'pizza' });
    expect(result.action).toBe('clear_search');
    expect(result.actionLabel).toBe('Clear search');
  });

  it('returns expand radius for distance-filtered zero results', () => {
    const result = resolveDiscoveryZeroResults({
      query: 'pizza',
      radiusKm: 5,
    });
    expect(result.action).toBe('expand_radius');
    expect(result.actionLabel).toBe('Expand to 10 km');
    expect(result.nextRadiusKm).toBe(10);
  });

  it('returns lower rating for rating-filtered zero results', () => {
    const result = resolveDiscoveryZeroResults({
      query: 'pizza',
      minRating: 4.5,
    });
    expect(result.action).toBe('lower_rating');
    expect(result.actionLabel).toBe('Lower to 4.0+');
    expect(result.nextMinRating).toBe(4);
  });

  it('prioritizes distance over query in multi-cause zero results', () => {
    const result = resolveDiscoveryZeroResults({
      query: 'pizza',
      radiusKm: 10,
    });
    expect(result.cause).toBe('distance');
    expect(result.action).toBe('expand_radius');
  });

  it('returns clear distance when distance is already at max tier', () => {
    const result = resolveDiscoveryZeroResults({
      query: 'pizza',
      radiusKm: 50,
    });
    expect(result.action).toBe('clear_radius');
    expect(result.actionLabel).toBe('Clear distance filter');
  });

  it('returns clear rating when rating is already at floor', () => {
    const result = resolveDiscoveryZeroResults({
      query: 'pizza',
      minRating: 0.5,
    });
    expect(result.action).toBe('clear_rating');
    expect(result.actionLabel).toBe('Clear rating filter');
  });
});

describe('getNextDistanceTier', () => {
  it('returns null when already at max tier', () => {
    expect(getNextDistanceTier(50)).toBeNull();
  });
});
