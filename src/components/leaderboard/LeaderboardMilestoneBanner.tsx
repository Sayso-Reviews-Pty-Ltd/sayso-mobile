import { StyleSheet, Text as RNText, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPrestigeInfo } from '../../lib/prestige';

const CHARCOAL = '#2D2D2D';

type Props = {
  reviewCount: number;
};

export function LeaderboardMilestoneBanner({ reviewCount }: Props) {
  if (reviewCount < 0) return null;

  const prestige = getPrestigeInfo(reviewCount);
  const isLegend = prestige.reviewsForNext === null;

  const suffix = isLegend
    ? "You've reached Legend!"
    : `${prestige.reviewsForNext === 1 ? '1 more review' : `${prestige.reviewsForNext} more reviews`} to level up`;

  return (
    <View style={s.banner}>
      <View style={s.left}>
        <Ionicons
          name={prestige.icon as keyof typeof Ionicons.glyphMap}
          size={16}
          color={prestige.color}
        />
        <RNText style={s.label} numberOfLines={2}>
          <RNText style={s.bold}>{`You're a ${prestige.label}`}</RNText>
          {' \u00B7 '}
          {suffix}
        </RNText>
      </View>
      <Ionicons name="chevron-forward-outline" size={14} color={CHARCOAL} />
    </View>
  );
}

const s = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(114,47,55,0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 13,
    color: CHARCOAL,
    flexShrink: 1,
  },
  bold: {
    fontWeight: '600',
    fontSize: 13,
    color: CHARCOAL,
  },
});
