import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Text } from '../../../../components/Typography';
import { APP_PAGE_GUTTER } from '../../../../styles/layout';
import { CHARCOAL, CORAL } from '../constants';
import { ProfileSectionCard } from './ProfileSectionCard';
import type { PrestigeInfo } from '../../../../lib/prestige';

type HeroMeta = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

type Props = {
  avatarUrl?: string | null;
  displayLabel: string;
  isTopReviewer?: boolean;
  bio?: string | null;
  heroMeta: HeroMeta[];
  reviewsCount: number;
  onEditProfile: () => void;
  prestige?: PrestigeInfo;
};

export function ProfileHeroCard({
  avatarUrl,
  displayLabel,
  isTopReviewer = false,
  bio,
  heroMeta,
  reviewsCount,
  onEditProfile,
  prestige,
}: Props) {
  return (
    <ProfileSectionCard style={styles.heroCard}>
      <View style={styles.heroContent}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Ionicons name="person-outline" size={38} color="rgba(45,45,45,0.50)" />
          </View>
        )}

        <View style={styles.heroNameRow}>
          <Text style={styles.heroName}>{displayLabel}</Text>
          {isTopReviewer ? (
            <View style={styles.topReviewerPill}>
              <Ionicons name="ribbon-outline" size={12} color="#7D9B76" />
              <Text style={styles.topReviewerText}>Top Reviewer</Text>
            </View>
          ) : null}
          {prestige ? (
            <View style={[styles.prestigePill, { backgroundColor: prestige.color + '22' }]}>
              <Text style={[styles.prestigePillText, { color: prestige.color }]}>
                {prestige.label}
              </Text>
            </View>
          ) : null}
        </View>

        {bio ? <Text style={styles.heroBio}>{bio}</Text> : null}

        <View style={styles.heroMetaWrap}>
          {heroMeta.map((item) => (
            <View key={`${item.icon}-${item.label}`} style={styles.heroMetaChip}>
              <View style={styles.heroMetaIconCircle}>
                <Ionicons name={item.icon} size={12} color="rgba(45,45,45,0.84)" />
              </View>
              <Text style={styles.heroMetaText}>{item.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.heroReviewCount}>{reviewsCount} reviews</Text>

        <Pressable style={styles.editProfileButton} onPress={onEditProfile}>
          <Ionicons name="create-outline" size={14} color="#FFFFFF" />
          <Text style={styles.editProfileButtonText}>Edit Profile</Text>
        </Pressable>
      </View>
    </ProfileSectionCard>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    marginTop: 12,
    overflow: 'hidden',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    position: 'relative',
    padding: 0,
    marginHorizontal: APP_PAGE_GUTTER,
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(229,224,229,0.55)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.72)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroNameRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heroName: {
    fontSize: 27,
    lineHeight: 31,
    fontWeight: '700',
    color: CHARCOAL,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  topReviewerPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(229,224,229,0.72)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topReviewerText: {
    fontSize: 11,
    color: '#7D9B76',
    fontWeight: '700',
  },
  prestigePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  prestigePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  heroBio: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(45,45,45,0.86)',
    textAlign: 'center',
  },
  heroMetaWrap: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    columnGap: 10,
    rowGap: 8,
  },
  heroMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroMetaIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(229,224,229,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroMetaText: {
    fontSize: 13,
    color: 'rgba(45,45,45,0.76)',
  },
  heroReviewCount: {
    marginTop: 12,
    fontSize: 13,
    color: 'rgba(45,45,45,0.72)',
    fontWeight: '600',
  },
  editProfileButton: {
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: CORAL,
    borderWidth: 1,
    borderColor: 'rgba(125,155,118,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  editProfileButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
