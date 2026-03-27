import { BADGE_MAPPINGS, BADGE_GROUPS } from '../../../lib/badgeMappings';
import type { BadgeGroup, BadgeMappingItem } from '../../../lib/badgeMappings';
import type { UserBadgeDto } from '../../../hooks/useUserBadges';
import type { BadgeLibraryItem } from './badgeScreenTypes';
import { RULE_COPY } from './badgeScreenTypes';

export function normalizeGroup(group: string | null | undefined, fallback: BadgeGroup = 'explorer'): BadgeGroup {
  return BADGE_GROUPS.includes(group as BadgeGroup) ? (group as BadgeGroup) : fallback;
}

export function buildRuleHowToEarn(ruleType: string | null | undefined, threshold: number | null | undefined): string | null {
  if (!ruleType || typeof threshold !== 'number' || threshold <= 0) return null;
  const action = RULE_COPY[ruleType];
  if (!action) return null;
  return `Complete ${threshold} ${action}.`;
}

export function mapBadgeDefinition(mapping: BadgeMappingItem): BadgeLibraryItem {
  return {
    id: mapping.id,
    name: mapping.name,
    description: mapping.description,
    howToEarn: mapping.howToEarn,
    badgeGroup: mapping.badgeGroup,
    imageKey: mapping.imageKey,
    iconPath: null,
  };
}

export function mapApiBadgeToLibraryItem(badge: UserBadgeDto): BadgeLibraryItem {
  const mapped = BADGE_MAPPINGS[badge.id];
  const mappedDefinition = mapped ? mapBadgeDefinition(mapped) : null;

  const name = typeof badge.name === 'string' && badge.name.trim().length > 0
    ? badge.name.trim()
    : mappedDefinition?.name ?? 'Badge';
  const description = typeof badge.description === 'string' && badge.description.trim().length > 0
    ? badge.description.trim()
    : mappedDefinition?.description ?? '';
  const howToEarn = (typeof badge.how_to_earn === 'string' && badge.how_to_earn.trim().length > 0
    ? badge.how_to_earn.trim()
    : null) ?? (typeof badge.howToEarn === 'string' && badge.howToEarn.trim().length > 0
    ? badge.howToEarn.trim()
    : null) ?? mappedDefinition?.howToEarn
    ?? buildRuleHowToEarn(badge.rule_type, badge.threshold)
    ?? 'Complete this badge objective to unlock it.';

  return {
    id: badge.id,
    name,
    description,
    howToEarn,
    badgeGroup: normalizeGroup(badge.badge_group, mappedDefinition?.badgeGroup ?? 'explorer'),
    imageKey: mappedDefinition?.imageKey ?? 'default',
    iconPath: badge.icon_path ?? null,
  };
}
