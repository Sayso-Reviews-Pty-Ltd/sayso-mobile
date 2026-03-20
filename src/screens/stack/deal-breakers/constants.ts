import type { SharedValue } from 'react-native-reanimated';

export const MIN = 1;
export const MAX = 3;

export const DEALBREAKERS = [
  {
    id: 'trustworthiness',
    label: 'Trustworthiness',
    description: 'Reliable and honest service',
  },
  {
    id: 'punctuality',
    label: 'Punctuality',
    description: 'On-time and respects your schedule',
  },
  {
    id: 'friendliness',
    label: 'Friendliness',
    description: 'Welcoming and helpful staff',
  },
  {
    id: 'value-for-money',
    label: 'Value for Money',
    description: 'Fair pricing and good quality',
  },
] as const;

export type DealbreakerId = (typeof DEALBREAKERS)[number]['id'];
export type DealbreakerIconName =
  | 'shield-checkmark-outline'
  | 'time-outline'
  | 'happy-outline'
  | 'pricetag-outline';

export type PreferenceDto = { id: string };
export type PreferencesResponseDto = { dealbreakers?: PreferenceDto[] };

export type CardMutables = {
  opacity: SharedValue<number>;
  y: SharedValue<number>;
  selectedScale: SharedValue<number>;
  flip: SharedValue<number>;
};

export const DEALBREAKER_ICONS: Record<DealbreakerId, DealbreakerIconName> = {
  trustworthiness: 'shield-checkmark-outline',
  punctuality: 'time-outline',
  friendliness: 'happy-outline',
  'value-for-money': 'pricetag-outline',
};
