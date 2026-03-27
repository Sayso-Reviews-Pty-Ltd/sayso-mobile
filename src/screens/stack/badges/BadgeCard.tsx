import { Image, type ImageSourcePropType, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getBadgeImage } from '../../../lib/badgeImages';
import { Text } from '../../../components/Typography';
import type { BadgeLibraryItem } from './badgeScreenTypes';
import { GRID, C } from './badgeScreenTypes';

function resolveBadgeImageSource(badge: BadgeLibraryItem): ImageSourcePropType {
  if (badge.iconPath && badge.iconPath.trim().length > 0) {
    return { uri: badge.iconPath };
  }
  return getBadgeImage(badge.imageKey);
}

export function BadgeCard({ badge }: { badge: BadgeLibraryItem }) {
  return (
    <View style={styles.badgeCard}>
      <Image source={resolveBadgeImageSource(badge)} style={styles.badgeCardImg} />
      <View style={styles.badgeCardContent}>
        <Text style={styles.badgeCardName}>{badge.name}</Text>
        <Text style={styles.badgeCardDesc} numberOfLines={2}>{badge.description}</Text>
        <View style={styles.badgeCardHowTo}>
          <Ionicons name="information-circle-outline" size={12} color={C.charcoal50} />
          <Text style={styles.badgeCardHowToText} numberOfLines={2}>{badge.howToEarn}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: GRID * 1.5,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 12,
    padding: GRID * 2,
    borderWidth: 1,
    borderColor: C.charcoal08,
  },
  badgeCardImg: {
    width: 44,
    height: 44,
    flexShrink: 0,
  },
  badgeCardContent: {
    flex: 1,
    gap: 4,
  },
  badgeCardName: {
    fontSize: 14,
    fontWeight: '700',
    color: C.charcoal,
  },
  badgeCardDesc: {
    fontSize: 13,
    color: C.charcoal70,
    lineHeight: 18,
  },
  badgeCardHowTo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: 2,
  },
  badgeCardHowToText: {
    flex: 1,
    fontSize: 12,
    color: C.charcoal50,
    lineHeight: 16,
  },
});
