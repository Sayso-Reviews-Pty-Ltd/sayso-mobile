/**
 * Badge mappings for mobile — full parity with sayso-web/src/app/lib/badgeMappings.ts
 * imageKey matches the 3-digit prefix in assets/badges/ (e.g. "011" → 011-compass.png)
 */

export type { BadgeGroup, BadgeMappingItem } from './types';
export { BADGE_GROUPS } from './types';
export { EXPLORER_BADGES } from './explorerBadges';
export { SPECIALIST_BADGES } from './specialistBadges';
export { MILESTONE_BADGES } from './milestoneBadges';
export { COMMUNITY_BADGES } from './communityBadges';

import { EXPLORER_BADGES } from './explorerBadges';
import { SPECIALIST_BADGES } from './specialistBadges';
import { MILESTONE_BADGES } from './milestoneBadges';
import { COMMUNITY_BADGES } from './communityBadges';
import type { BadgeGroup, BadgeMappingItem } from './types';

export const BADGE_MAPPINGS: Record<string, BadgeMappingItem> = {
  ...EXPLORER_BADGES,
  ...SPECIALIST_BADGES,
  ...MILESTONE_BADGES,
  ...COMMUNITY_BADGES,
};

export function getBadgeById(id: string): BadgeMappingItem | undefined {
  return BADGE_MAPPINGS[id];
}

export function getBadgesByGroup(group: BadgeGroup): BadgeMappingItem[] {
  return Object.values(BADGE_MAPPINGS).filter((b) => b.badgeGroup === group);
}
