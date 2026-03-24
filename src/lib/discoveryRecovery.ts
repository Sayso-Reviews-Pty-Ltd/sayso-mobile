import type { BusinessListItemDto } from '@sayso/contracts';

export const DISCOVERY_DISTANCE_TIERS = [1, 3, 5, 10, 20, 50] as const;
export const DISCOVERY_RATING_STEP = 0.5;
export const DISCOVERY_RATING_FLOOR = 0.5;

export type DiscoveryRecoveryAction =
  | 'expand_radius'
  | 'clear_radius'
  | 'lower_rating'
  | 'clear_rating'
  | 'clear_search'
  | 'browse_trending';

export type DiscoveryRecoveryCause =
  | 'distance'
  | 'rating'
  | 'query'
  | 'category_or_interest'
  | 'default';

export type DiscoveryRecoveryResolution = {
  cause: DiscoveryRecoveryCause;
  action: DiscoveryRecoveryAction;
  actionLabel: string;
  message: string;
  nextRadiusKm: number | null;
  nextMinRating: number | null;
};

type ResolveDiscoveryZeroResultsInput = {
  query?: string | null;
  minRating?: number | null;
  radiusKm?: number | null;
  hasCategoryOrInterestConstraint?: boolean;
};

export type ForYouFallbackTier = 'tier_1' | 'tier_2' | 'tier_3' | 'tier_4';

export function getNextDistanceTier(radiusKm: number | null) {
  if (radiusKm == null) {
    return DISCOVERY_DISTANCE_TIERS[0];
  }

  for (const tier of DISCOVERY_DISTANCE_TIERS) {
    if (tier > radiusKm) {
      return tier;
    }
  }

  return null;
}

function getLowerRating(minRating: number | null) {
  if (minRating == null) {
    return null;
  }

  const lowered = Number((minRating - DISCOVERY_RATING_STEP).toFixed(1));
  return Math.max(DISCOVERY_RATING_FLOOR, lowered);
}

function formatRating(rating: number) {
  return `${rating.toFixed(1)}+`;
}

const FOR_YOU_FALLBACK_LABELS: Record<ForYouFallbackTier, string> = {
  tier_1: 'Matched your interests',
  tier_2: 'Based on your interests',
  tier_3: 'Popular nearby',
  tier_4: 'Trending picks',
};
const FOR_YOU_TIER_PRIORITY: ForYouFallbackTier[] = [
  'tier_1',
  'tier_2',
  'tier_3',
  'tier_4',
];

export function getForYouFallbackTierLabel(tier?: string | null) {
  if (!tier) {
    return null;
  }
  return FOR_YOU_FALLBACK_LABELS[tier as ForYouFallbackTier] ?? null;
}

export function hasSparseForYouFallback(items: BusinessListItemDto[]) {
  return items.some(
    (item) => item.fallback_tier === 'tier_3' || item.fallback_tier === 'tier_4'
  );
}

export function getHighestPriorityForYouTier(items: BusinessListItemDto[]) {
  for (const tier of FOR_YOU_TIER_PRIORITY) {
    if (items.some((item) => item.fallback_tier === tier)) {
      return tier;
    }
  }
  return null;
}

export function resolveDiscoveryZeroResults({
  query,
  minRating = null,
  radiusKm = null,
  hasCategoryOrInterestConstraint = false,
}: ResolveDiscoveryZeroResultsInput): DiscoveryRecoveryResolution {
  const normalizedQuery = (query ?? '').trim();

  // Priority is strict: distance -> rating -> query -> category/interest -> default.
  if (radiusKm !== null) {
    const nextRadius = getNextDistanceTier(radiusKm);
    if (nextRadius !== null) {
      return {
        cause: 'distance',
        action: 'expand_radius',
        actionLabel: `Expand to ${nextRadius} km`,
        message: `No results within ${radiusKm} km radius.`,
        nextRadiusKm: nextRadius,
        nextMinRating: null,
      };
    }

    return {
      cause: 'distance',
      action: 'clear_radius',
      actionLabel: 'Clear distance filter',
      message: 'No results within 50 km radius.',
      nextRadiusKm: null,
      nextMinRating: null,
    };
  }

  if (minRating !== null) {
    const lowered = getLowerRating(minRating);
    if (lowered !== null && lowered < minRating) {
      return {
        cause: 'rating',
        action: 'lower_rating',
        actionLabel: `Lower to ${formatRating(lowered)}`,
        message: `No results at ${formatRating(minRating)} rating.`,
        nextRadiusKm: null,
        nextMinRating: lowered,
      };
    }

    return {
      cause: 'rating',
      action: 'clear_rating',
      actionLabel: 'Clear rating filter',
      message: `No results at ${formatRating(minRating)} rating.`,
      nextRadiusKm: null,
      nextMinRating: null,
    };
  }

  if (normalizedQuery.length > 0) {
    return {
      cause: 'query',
      action: 'clear_search',
      actionLabel: 'Clear search',
      message: 'Try a shorter or different search.',
      nextRadiusKm: null,
      nextMinRating: null,
    };
  }

  if (hasCategoryOrInterestConstraint) {
    return {
      cause: 'category_or_interest',
      action: 'browse_trending',
      actionLabel: 'Browse all Trending',
      message: 'No results matching your interests yet.',
      nextRadiusKm: null,
      nextMinRating: null,
    };
  }

  return {
    cause: 'default',
    action: 'browse_trending',
    actionLabel: 'Browse all Trending',
    message: 'No matches found right now.',
    nextRadiusKm: null,
    nextMinRating: null,
  };
}
