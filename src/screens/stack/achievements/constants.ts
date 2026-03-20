import { Ionicons } from '@expo/vector-icons';

export const GRID = 8;

export const C = {
  bg: '#2D2D2D',
  cardDark: 'rgba(255,255,255,0.07)',
  cardDarkBorder: 'rgba(255,255,255,0.1)',
  white: '#FFFFFF',
  white70: 'rgba(255,255,255,0.7)',
  white50: 'rgba(255,255,255,0.5)',
  white10: 'rgba(255,255,255,0.1)',
  gold: '#FFD700',
  wine: '#722F37',
} as const;

export const GROUP_META: Record<
  string,
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  explorer: { label: 'Explorer', icon: 'compass-outline', color: '#60A5FA' },
  specialist: { label: 'Specialist', icon: 'ribbon-outline', color: '#34D399' },
  milestone: { label: 'Milestone', icon: 'trophy-outline', color: '#FFD700' },
  community: { label: 'Community', icon: 'people-outline', color: '#F472B6' },
};
