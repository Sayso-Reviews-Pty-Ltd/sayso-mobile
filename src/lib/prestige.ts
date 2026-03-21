// ─── Prestige Tier System ─────────────────────────────────────────────────────
// Client-side prestige calculation derived from existing UserStatsDto.
// Pure functions — no network calls. Used on profile, leaderboard, and
// post-action share moments.

// Re-export from contracts so consumers have a single import source.
export type { PrestigeTier } from '../contracts';

export type PrestigeInfo = {
  tier: PrestigeTier;
  label: string;
  tagline: string;
  /** Ionicons name */
  icon: string;
  /** Brand-aligned hex color for this tier */
  color: string;
  /** Reviews needed to reach next tier, null if at Legend */
  reviewsForNext: number | null;
  /** Progress within current tier, 0–1 */
  progressPct: number;
};

type TierDef = {
  tier: PrestigeTier;
  min: number;
  label: string;
  tagline: string;
  icon: string;
  color: string;
};

const TIER_DEFS: TierDef[] = [
  { tier: 'scout',       min: 0,   label: 'Scout',       tagline: 'Just getting started',  icon: 'compass-outline',          color: '#9DAB9B' },
  { tier: 'rookie',      min: 5,   label: 'Rookie',      tagline: 'Building momentum',      icon: 'star-outline',             color: '#7D9B76' },
  { tier: 'contributor', min: 15,  label: 'Contributor', tagline: 'Making your mark',       icon: 'pencil-outline',           color: '#D4915C' },
  { tier: 'regular',     min: 30,  label: 'Regular',     tagline: 'A familiar voice',       icon: 'person-circle-outline',    color: '#C0A050' },
  { tier: 'expert',      min: 50,  label: 'Expert',      tagline: 'Trusted reviewer',       icon: 'shield-checkmark-outline', color: '#E8A030' },
  { tier: 'elite',       min: 100, label: 'Elite',       tagline: 'Community pillar',       icon: 'trophy-outline',           color: '#FBBF24' },
  { tier: 'legend',      min: 200, label: 'Legend',      tagline: 'Sayso Legend',           icon: 'medal-outline',            color: '#722F37' },
];

export function getPrestigeInfo(reviewCount: number): PrestigeInfo {
  let currentIdx = 0;
  for (let i = 0; i < TIER_DEFS.length; i++) {
    if (reviewCount >= TIER_DEFS[i].min) {
      currentIdx = i;
    }
  }

  const current = TIER_DEFS[currentIdx];
  const next = TIER_DEFS[currentIdx + 1] ?? null;

  let progressPct = 1;
  let reviewsForNext: number | null = null;

  if (next) {
    const range = next.min - current.min;
    const done = reviewCount - current.min;
    progressPct = Math.min(1, done / range);
    reviewsForNext = next.min - reviewCount;
  }

  return {
    tier: current.tier,
    label: current.label,
    tagline: current.tagline,
    icon: current.icon,
    color: current.color,
    reviewsForNext,
    progressPct,
  };
}

/** Returns a short motivational prompt for the "next milestone" surface. */
export function getNextMilestonePrompt(info: PrestigeInfo): string | null {
  if (info.reviewsForNext === null) return null;
  if (info.reviewsForNext === 1) return '1 more review to level up';
  return `${info.reviewsForNext} more reviews to level up`;
}
