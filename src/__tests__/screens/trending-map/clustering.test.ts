import {
  buildClusters,
  getOffsetCoordinate,
  toClusterKey,
} from '../../../screens/stack/trending-map/clustering';

describe('trending-map/clustering', () => {
  it('creates stable rounded cluster keys', () => {
    expect(toClusterKey(-33.924901, 18.42412)).toBe('-33.925:18.424');
  });

  it('returns base coordinate when cluster has single member', () => {
    const point = getOffsetCoordinate(-33.9, 18.4, 0, 1);
    expect(point).toEqual({ latitude: -33.9, longitude: 18.4 });
  });

  it('returns offset coordinate for expanded members', () => {
    const point = getOffsetCoordinate(-33.9, 18.4, 1, 4);
    const deltaLat = Math.abs(point.latitude - -33.9);
    const deltaLng = Math.abs(point.longitude - 18.4);
    expect(deltaLat + deltaLng).toBeGreaterThan(0);
  });

  it('groups businesses by rounded coordinate and computes center', () => {
    const clusters = buildClusters([
      { id: 'a', lat: -33.9249, lng: 18.4241 },
      { id: 'b', lat: -33.92491, lng: 18.42409 },
      { id: 'c', lat: -33.9301, lng: 18.4302 },
    ] as any);

    expect(clusters).toHaveLength(2);

    const largest = clusters.find((cluster) => cluster.members.length === 2);
    expect(largest).toBeTruthy();
    expect(largest?.centerLat).toBeCloseTo(-33.924905, 5);
    expect(largest?.centerLng).toBeCloseTo(18.424095, 5);
  });
});
