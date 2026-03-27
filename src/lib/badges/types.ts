export type BadgeGroup = 'explorer' | 'specialist' | 'milestone' | 'community';

export interface BadgeMappingItem {
  id: string;
  name: string;
  description: string;
  howToEarn: string;
  ionicon: string;
  imageKey: string;
  badgeGroup: BadgeGroup;
  categoryKey?: string;
}

export const BADGE_GROUPS: BadgeGroup[] = ['explorer', 'specialist', 'milestone', 'community'];
