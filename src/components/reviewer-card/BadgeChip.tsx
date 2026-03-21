import { View } from 'react-native';
import { Text } from '../Typography';
import { BADGE_COLORS, BADGE_LABELS } from './theme';
import { chipStyles } from './styles';
import type { BadgeType } from './types';

type Props = {
  badge: BadgeType;
  isTopCard: boolean;
};

export function BadgeChip({ badge, isTopCard }: Props) {
  const colors = isTopCard && badge !== 'top'
    ? { bg: 'rgba(69,26,3,0.40)', border: 'rgba(251,191,36,0.12)', text: 'rgba(251,191,36,0.60)' }
    : BADGE_COLORS[badge] ?? BADGE_COLORS.verified;

  return (
    <View style={[chipStyles.chip, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={[chipStyles.label, { color: colors.text }]}>{BADGE_LABELS[badge]}</Text>
    </View>
  );
}
