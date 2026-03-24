import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { SkeletonBlock } from '../../../../components/SkeletonBlock';
import { Text } from '../../../../components/Typography';
import type { UserBadgeDto } from '../../../../hooks/useUserBadges';
import { badgeImageSource } from '../helpers';
import { CORAL, CHARCOAL } from '../constants';
import { ProfileSectionCard } from './ProfileSectionCard';
import { NextBadgeNudge } from './NextBadgeNudge';

type Props = {
  badges: UserBadgeDto[];
  isLoading: boolean;
  onViewAll: () => void;
};

export function ProfileBadgesSection({ badges, isLoading, onViewAll }: Props) {
  return (
    <ProfileSectionCard>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeaderLeft}>
          <View style={styles.sectionIconCircle}>
            <Ionicons name="ribbon-outline" size={14} color="rgba(45,45,45,0.84)" />
          </View>
          <Text style={styles.sectionTitle}>Badges</Text>
        </View>
        {badges.length > 0 ? (
          <Pressable style={styles.inlineLink} onPress={onViewAll}>
            <Text style={styles.inlineLinkText}>View all</Text>
            <Ionicons name="chevron-forward-outline" size={14} color={CORAL} />
          </Pressable>
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.badgesGrid}>
          {[0, 1, 2, 3].map((index) => (
            <View key={`badge-skeleton-${index}`} style={styles.badgeTile}>
              <SkeletonBlock style={{ width: 28, height: 28, borderRadius: 14 }} />
              <SkeletonBlock style={{ width: '86%', height: 11, borderRadius: 6, marginTop: 6 }} />
              <SkeletonBlock style={{ width: '70%', height: 10, borderRadius: 5, marginTop: 4 }} />
            </View>
          ))}
        </View>
      ) : badges.length === 0 ? (
        <View style={styles.emptyStateWrap}>
          <Text style={styles.emptyStateText}>
            No badges earned yet. Start reviewing businesses to unlock badges.
          </Text>
        </View>
      ) : (
        <View style={styles.badgesGrid}>
          {badges.map((badge, index) => {
            const source = badgeImageSource(badge.icon_path);
            return (
              <View key={`${badge.id}-${index}`} style={styles.badgeTile}>
                {source ? (
                  <Image source={source} style={styles.badgeIcon} contentFit="contain" />
                ) : (
                  <View style={styles.badgeFallbackIcon}>
                    <Ionicons name="ribbon-outline" size={16} color="rgba(45,45,45,0.84)" />
                  </View>
                )}
                <Text numberOfLines={1} style={styles.badgeName}>
                  {badge.name}
                </Text>
                <Text numberOfLines={2} style={styles.badgeDescription}>
                  {badge.description || 'Earned badge'}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.nudgeDivider} />

      <View style={styles.nudgeHeader}>
        <View style={styles.sectionIconCircle}>
          <Ionicons name="lock-closed-outline" size={14} color="rgba(45,45,45,0.84)" />
        </View>
        <Text style={styles.sectionTitle}>Progress to next</Text>
      </View>

      <NextBadgeNudge />
    </ProfileSectionCard>
  );
}

const styles = StyleSheet.create({
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  sectionIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(229,224,229,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    color: CHARCOAL,
    fontWeight: '700',
  },
  inlineLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  inlineLinkText: {
    color: CORAL,
    fontSize: 12,
    fontWeight: '700',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeTile: {
    width: '48.4%',
    minHeight: 96,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    backgroundColor: 'rgba(229,224,229,0.72)',
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  badgeIcon: {
    width: 30,
    height: 30,
    marginBottom: 7,
  },
  badgeFallbackIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
    marginBottom: 7,
  },
  badgeName: {
    fontSize: 11,
    color: CHARCOAL,
    fontWeight: '700',
    textAlign: 'center',
  },
  badgeDescription: {
    marginTop: 3,
    fontSize: 10,
    color: 'rgba(45,45,45,0.74)',
    textAlign: 'center',
    lineHeight: 13,
  },
  emptyStateWrap: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 13,
    color: 'rgba(45,45,45,0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  nudgeDivider: {
    height: 1,
    backgroundColor: 'rgba(45,45,45,0.08)',
    marginVertical: 16,
  },
  nudgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
});
