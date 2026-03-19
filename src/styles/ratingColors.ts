/**
 * Tier-based gradient pairs for rating badges.
 *
 * Gold   > 4.0  — high quality
 * Bronze > 2.0  — average
 * Low    ≤ 2.0  — poor
 */

export const RATING_GRADIENT_GOLD   = ['#F7D060', '#E8A030'] as const;
export const RATING_GRADIENT_BRONZE = ['#E8A87C', '#D4915C'] as const;
export const RATING_GRADIENT_LOW    = ['#F08080', '#D66B6B'] as const;

export function getRatingGradient(
  rating: number,
): readonly [string, string] {
  if (rating > 4.0) return RATING_GRADIENT_GOLD;
  if (rating > 2.0) return RATING_GRADIENT_BRONZE;
  return RATING_GRADIENT_LOW;
}
