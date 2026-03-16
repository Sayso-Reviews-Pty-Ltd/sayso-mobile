import { calculateDistanceKm } from '../../lib/distance';

describe('calculateDistanceKm', () => {
  it('returns 0 for identical coordinates', () => {
    const distance = calculateDistanceKm(-33.9249, 18.4241, -33.9249, 18.4241);
    expect(distance).toBe(0);
  });

  it('calculates known distance — Cape Town to Johannesburg (~1270km)', () => {
    const distance = calculateDistanceKm(-33.9249, 18.4241, -26.2041, 28.0473);
    expect(distance).toBeGreaterThanOrEqual(1250);
    expect(distance).toBeLessThanOrEqual(1290);
  });

  it('calculates short distance correctly — same city blocks', () => {
    const distance = calculateDistanceKm(-33.9249, 18.4241, -33.9256, 18.4238);
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(0.2);
  });

  it('is symmetric — A→B equals B→A', () => {
    const aToB = calculateDistanceKm(-26.2041, 28.0473, -34.1183, 18.8521);
    const bToA = calculateDistanceKm(-34.1183, 18.8521, -26.2041, 28.0473);
    expect(aToB).toBeCloseTo(bToA, 6);
  });

  it('handles southern hemisphere coordinates correctly', () => {
    const distance = calculateDistanceKm(-33.9249, 18.4241, -34.1183, 18.8521);
    expect(distance).toBeGreaterThan(30);
    expect(distance).toBeLessThan(50);
  });

  it('handles coordinates that cross the equator', () => {
    const distance = calculateDistanceKm(-1.286389, 36.817223, 0.347596, 32.58252);
    expect(distance).toBeGreaterThan(500);
    expect(distance).toBeLessThan(750);
  });
});
