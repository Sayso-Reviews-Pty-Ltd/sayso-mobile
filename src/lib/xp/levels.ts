/**
 * XP level curve utilities — pure functions, no side-effects.
 * Mirrors the web app's lib/xp/levels.ts and the PostgreSQL
 * xp_required_for_level() function in the DB migration.
 *
 * Curve: xp_required_for_level(n) = floor(100 * n^1.5)
 *   L1→L2:   100 XP
 *   L5→L6:   559 XP
 *   L10→L11: 1581 XP
 */

export interface LevelState {
  level: number;
  xpIntoCurrentLevel: number;
  xpToNextLevel: number;
  percentToNext: number;
}

export const LEVEL_PERKS: Record<number, string> = {
  5:  'Streak shield unlocked',
  10: 'Gold profile border',
  15: 'Access to monthly leaderboard',
  20: 'Early access badge eligibility',
  30: 'Featured reviewer candidacy',
  50: 'Legend profile frame',
};

export function xpRequiredForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

export function currentLevelFromXP(totalXP: number): LevelState {
  let level = 1;
  let accumulated = 0;

  while (true) {
    const needed = xpRequiredForLevel(level);
    if (accumulated + needed > totalXP) break;
    accumulated += needed;
    level++;
  }

  const xpToNextLevel = xpRequiredForLevel(level);
  const xpIntoCurrentLevel = totalXP - accumulated;
  const percentToNext =
    xpToNextLevel > 0
      ? Math.min(100, Math.round((xpIntoCurrentLevel / xpToNextLevel) * 100))
      : 100;

  return { level, xpIntoCurrentLevel, xpToNextLevel, percentToNext };
}

/** Returns the next level perk at or above the given level, if any. */
export function nextPerkAt(level: number): { level: number; perk: string } | null {
  const milestones = Object.keys(LEVEL_PERKS).map(Number).sort((a, b) => a - b);
  const next = milestones.find((m) => m > level);
  if (!next) return null;
  return { level: next, perk: LEVEL_PERKS[next] };
}
