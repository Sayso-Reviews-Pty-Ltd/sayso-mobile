import { SPECIALIST_FOOD_BADGES } from './specialistFoodBadges';
import { SPECIALIST_BEAUTY_BADGES, SPECIALIST_ARTS_BADGES } from './specialistBeautyArtsBadges';
import { SPECIALIST_OUTDOORS_BADGES, SPECIALIST_SHOPPING_BADGES } from './specialistOutdoorsShoppingBadges';
import {
  SPECIALIST_FAMILY_BADGES,
  SPECIALIST_EXPERIENCES_BADGES,
  SPECIALIST_SERVICES_BADGES,
} from './specialistFamilyExperiencesBadges';
import type { BadgeMappingItem } from './types';

export { SPECIALIST_FOOD_BADGES } from './specialistFoodBadges';
export { SPECIALIST_BEAUTY_BADGES, SPECIALIST_ARTS_BADGES } from './specialistBeautyArtsBadges';
export { SPECIALIST_OUTDOORS_BADGES, SPECIALIST_SHOPPING_BADGES } from './specialistOutdoorsShoppingBadges';
export {
  SPECIALIST_FAMILY_BADGES,
  SPECIALIST_EXPERIENCES_BADGES,
  SPECIALIST_SERVICES_BADGES,
} from './specialistFamilyExperiencesBadges';

export const SPECIALIST_BADGES: Record<string, BadgeMappingItem> = {
  ...SPECIALIST_FOOD_BADGES,
  ...SPECIALIST_BEAUTY_BADGES,
  ...SPECIALIST_ARTS_BADGES,
  ...SPECIALIST_OUTDOORS_BADGES,
  ...SPECIALIST_SHOPPING_BADGES,
  ...SPECIALIST_FAMILY_BADGES,
  ...SPECIALIST_EXPERIENCES_BADGES,
  ...SPECIALIST_SERVICES_BADGES,
};
