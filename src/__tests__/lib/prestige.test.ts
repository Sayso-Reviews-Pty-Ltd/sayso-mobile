import { getPrestigeInfo, getNextMilestonePrompt } from '../../lib/prestige';

// ─── Tier boundary table ──────────────────────────────────────────────────────

const TIER_CASES: [number, string, string][] = [
  [0,   'scout',       'Scout'],
  [4,   'scout',       'Scout'],
  [5,   'rookie',      'Rookie'],
  [14,  'rookie',      'Rookie'],
  [15,  'contributor', 'Contributor'],
  [29,  'contributor', 'Contributor'],
  [30,  'regular',     'Regular'],
  [49,  'regular',     'Regular'],
  [50,  'expert',      'Expert'],
  [99,  'expert',      'Expert'],
  [100, 'elite',       'Elite'],
  [199, 'elite',       'Elite'],
  [200, 'legend',      'Legend'],
  [500, 'legend',      'Legend'],
];

describe('getPrestigeInfo — tier assignment', () => {
  it.each(TIER_CASES)(
    'reviewCount=%i → tier=%s, label=%s',
    (count, expectedTier, expectedLabel) => {
      const info = getPrestigeInfo(count);
      expect(info.tier).toBe(expectedTier);
      expect(info.label).toBe(expectedLabel);
    },
  );
});

// ─── reviewsForNext ───────────────────────────────────────────────────────────

describe('getPrestigeInfo — reviewsForNext', () => {
  it('is null at Legend (200)', () => {
    expect(getPrestigeInfo(200).reviewsForNext).toBeNull();
  });

  it('is null above Legend', () => {
    expect(getPrestigeInfo(999).reviewsForNext).toBeNull();
  });

  it('is 5 at Scout (0) — next tier Rookie needs 5', () => {
    expect(getPrestigeInfo(0).reviewsForNext).toBe(5);
  });

  it('is 1 at 199 — one review away from Legend', () => {
    expect(getPrestigeInfo(199).reviewsForNext).toBe(1);
  });

  it('is 5 at Rookie (10) — Contributor at 15', () => {
    expect(getPrestigeInfo(10).reviewsForNext).toBe(5);
  });

  it('is correct at exact tier start', () => {
    // Rookie starts at 5, next Contributor at 15 → 10 away
    expect(getPrestigeInfo(5).reviewsForNext).toBe(10);
  });
});

// ─── progressPct ─────────────────────────────────────────────────────────────

describe('getPrestigeInfo — progressPct', () => {
  it('is 1 for Legend', () => {
    expect(getPrestigeInfo(200).progressPct).toBe(1);
  });

  it('is 0 at exact tier start (Rookie at 5)', () => {
    // Rookie: 5–14, range 10. done = 5-5 = 0. pct = 0/10 = 0
    expect(getPrestigeInfo(5).progressPct).toBe(0);
  });

  it('is 0.5 at tier midpoint (Rookie at 10)', () => {
    // Rookie: 5–14. done = 10-5 = 5. range = 15-5 = 10. pct = 5/10 = 0.5
    expect(getPrestigeInfo(10).progressPct).toBe(0.5);
  });

  it('is capped at 1 (never exceeds 1)', () => {
    for (const count of [0, 50, 100, 200, 500]) {
      expect(getPrestigeInfo(count).progressPct).toBeLessThanOrEqual(1);
      expect(getPrestigeInfo(count).progressPct).toBeGreaterThanOrEqual(0);
    }
  });
});

// ─── Shape of returned object ─────────────────────────────────────────────────

describe('getPrestigeInfo — returned shape', () => {
  it('returns a hex color string', () => {
    const info = getPrestigeInfo(0);
    expect(info.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('returns a non-empty icon string', () => {
    const info = getPrestigeInfo(0);
    expect(typeof info.icon).toBe('string');
    expect(info.icon.length).toBeGreaterThan(0);
  });

  it('returns a non-empty tagline', () => {
    const info = getPrestigeInfo(0);
    expect(typeof info.tagline).toBe('string');
    expect(info.tagline.length).toBeGreaterThan(0);
  });

  it('each tier has a distinct color', () => {
    const tiers = [0, 5, 15, 30, 50, 100, 200];
    const colors = tiers.map((n) => getPrestigeInfo(n).color);
    const unique = new Set(colors);
    expect(unique.size).toBe(tiers.length);
  });
});

// ─── getNextMilestonePrompt ───────────────────────────────────────────────────

describe('getNextMilestonePrompt', () => {
  it('returns null for Legend tier', () => {
    expect(getNextMilestonePrompt(getPrestigeInfo(200))).toBeNull();
  });

  it('returns singular "1 more review to level up" when 1 away', () => {
    expect(getNextMilestonePrompt(getPrestigeInfo(199))).toBe(
      '1 more review to level up',
    );
  });

  it('returns plural "5 more reviews to level up" when 5 away', () => {
    expect(getNextMilestonePrompt(getPrestigeInfo(0))).toBe(
      '5 more reviews to level up',
    );
  });

  it('uses the exact reviewsForNext value from getPrestigeInfo', () => {
    const info = getPrestigeInfo(10); // Rookie, 5 away from Contributor
    expect(getNextMilestonePrompt(info)).toBe('5 more reviews to level up');
  });

  it('returns null only when reviewsForNext is null', () => {
    const info = getPrestigeInfo(200);
    expect(info.reviewsForNext).toBeNull();
    expect(getNextMilestonePrompt(info)).toBeNull();
  });
});
