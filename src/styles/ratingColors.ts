/**
 * Tier-based gradient pairs for rating badges.
 *
 * Gold   ≥ 4.0  — top quality
 * Silver ≥ 3.0  — good
 * Bronze  < 3.0  — average / unproven
 */

export const RATING_GRADIENT_GOLD: [string, string] = ['#FFD166', '#C8860A'];
export const RATING_GRADIENT_SILVER: [string, string] = ['#D8D8D8', '#9E9E9E'];
export const RATING_GRADIENT_BRONZE: [string, string] = ['#D4915C', '#8B5A2B'];

export function getRatingGradient(rating: number): [string, string] {
  if (rating >= 4.0) return RATING_GRADIENT_GOLD;
  if (rating >= 3.0) return RATING_GRADIENT_SILVER;
  return RATING_GRADIENT_BRONZE;
}
