import type { BadgeGroup } from '../../../lib/badgeMappings';
import { Ionicons } from '@expo/vector-icons';

export interface BadgeLibraryItem {
  id: string;
  name: string;
  description: string;
  howToEarn: string;
  badgeGroup: BadgeGroup;
  imageKey: string;
  iconPath: string | null;
}

export const GRID = 8;

export const C = {
  page: '#E5E0E5',
  card: '#9DAB9B',
  charcoal: '#2D2D2D',
  charcoal70: 'rgba(45,45,45,0.7)',
  charcoal60: 'rgba(45,45,45,0.6)',
  charcoal50: 'rgba(45,45,45,0.5)',
  charcoal20: 'rgba(45,45,45,0.2)',
  charcoal08: 'rgba(45,45,45,0.08)',
  white: '#FFFFFF',
  wine: '#722F37',
  sage: '#7D9B76',
  inputBg: 'rgba(255,255,255,0.95)',
  inputBorder: 'rgba(45,45,45,0.15)',
};

export const GROUP_LABELS: Record<string, string> = {
  explorer: 'Explorer',
  specialist: 'Specialist',
  milestone: 'Milestone',
  community: 'Community',
};

export const GROUP_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  explorer: 'compass-outline',
  specialist: 'ribbon-outline',
  milestone: 'trophy-outline',
  community: 'people-outline',
};

export const GROUP_COLORS: Record<string, string> = {
  explorer: '#60A5FA',
  specialist: '#34D399',
  milestone: '#FFD700',
  community: '#F472B6',
};

export const RULE_COPY: Record<string, string> = {
  review_count: 'reviews',
  category_review_count: 'reviews in this category',
  distinct_category_count: 'different categories',
  photo_count: 'reviews with photos',
  helpful_votes_total: 'helpful votes given',
  helpful_votes_received: 'helpful votes received',
  streak_days: 'consecutive days of reviewing',
  weekly_streak: 'consecutive weeks of reviewing',
  loyal_reviewer: 'reviews for one business',
};
