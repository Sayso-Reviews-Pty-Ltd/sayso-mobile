import {
  SKELETON_SHIMMER_DURATION_MS,
  SKELETON_SHIMMER_WIDTH_PERCENT,
} from '../../components/SkeletonBlock';

describe('SkeletonBlock shimmer tokens', () => {
  it('keeps shimmer width in premium range', () => {
    expect(SKELETON_SHIMMER_WIDTH_PERCENT).toBeGreaterThanOrEqual(200);
    expect(SKELETON_SHIMMER_WIDTH_PERCENT).toBeLessThanOrEqual(300);
    expect(SKELETON_SHIMMER_WIDTH_PERCENT).toBe(240);
  });

  it('keeps shimmer duration in premium range', () => {
    expect(SKELETON_SHIMMER_DURATION_MS).toBeGreaterThanOrEqual(1800);
    expect(SKELETON_SHIMMER_DURATION_MS).toBeLessThanOrEqual(2200);
    expect(SKELETON_SHIMMER_DURATION_MS).toBe(2000);
  });
});
