/**
 * Re-export shim — all badge data now lives in src/lib/badges/.
 * This file exists solely to preserve existing import paths.
 */
export type { BadgeGroup, BadgeMappingItem } from './badges/types';
export { BADGE_GROUPS } from './badges/types';
export { BADGE_MAPPINGS, getBadgeById, getBadgesByGroup } from './badges/index';
