import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/Typography';
import { BadgeCard } from './BadgeCard';
import type { BadgeLibraryItem } from './badgeScreenTypes';
import { GRID, C, GROUP_LABELS, GROUP_ICONS, GROUP_COLORS } from './badgeScreenTypes';

interface BadgeSectionProps {
  groupKey: string;
  badges: BadgeLibraryItem[];
}

export function BadgeSection({ groupKey, badges }: BadgeSectionProps) {
  const label = GROUP_LABELS[groupKey] ?? groupKey;
  const icon = GROUP_ICONS[groupKey] ?? 'ribbon-outline';
  const color = GROUP_COLORS[groupKey] ?? C.wine;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconWrap, { backgroundColor: `${color}18` }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={styles.sectionTitle}>{label} Badges</Text>
        <View style={styles.sectionCount}>
          <Text style={styles.sectionCountText}>{badges.length}</Text>
        </View>
      </View>
      <View style={styles.badgeList}>
        {badges.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: GRID * 1.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GRID,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: C.charcoal,
    letterSpacing: -0.2,
  },
  sectionCount: {
    paddingHorizontal: GRID,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: C.charcoal08,
  },
  sectionCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.charcoal60,
  },
  badgeList: {
    gap: GRID,
  },
});
