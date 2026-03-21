import type { BadgeType } from './types';

export const C = {
  coral: '#722F37',
  charcoal: '#2D2D2D',
  sage: '#7D9B76',
  cardBg: '#9DAB9B',
  offWhite: '#E5E0E5',
  white: '#FFFFFF',
  amber400: '#FBBF24',
  amber300: '#FCD34D',
  amber100: '#FEF3C7',
  topBg: '#1c1712',
  charcoal60: 'rgba(45,45,45,0.60)',
  charcoal45: 'rgba(45,45,45,0.45)',
  charcoal40: 'rgba(45,45,45,0.40)',
  charcoal38: 'rgba(45,45,45,0.38)',
  charcoal35: 'rgba(45,45,45,0.35)',
  charcoal28: 'rgba(45,45,45,0.28)',
  charcoal20: 'rgba(45,45,45,0.20)',
  charcoal08: 'rgba(45,45,45,0.08)',
  charcoal06: 'rgba(45,45,45,0.06)',
  charcoal05: 'rgba(45,45,45,0.05)',
  amber40: 'rgba(251,191,36,0.80)',
  amber45: 'rgba(251,191,36,0.45)',
  amber12: 'rgba(251,191,36,0.12)',
  amberBg: 'rgba(69,26,3,0.40)',
  amberBgHover: 'rgba(69,26,3,0.60)',
  offWhite70: 'rgba(229,224,229,0.70)',
  offWhite50: 'rgba(229,224,229,0.50)',
  coralFill: 'rgba(114,47,55,0.65)',
};

export const BADGE_LABELS: Record<BadgeType, string> = {
  top: '★ Top Reviewer',
  verified: '✓ Verified',
  local: '📍 Local Expert',
};

export const BADGE_COLORS: Record<BadgeType, { bg: string; border: string; text: string }> = {
  top: { bg: C.amberBg, border: C.amber12, text: C.amber300 },
  verified: { bg: C.offWhite70, border: C.charcoal06, text: C.sage },
  local: { bg: C.offWhite70, border: C.charcoal06, text: C.sage },
};
