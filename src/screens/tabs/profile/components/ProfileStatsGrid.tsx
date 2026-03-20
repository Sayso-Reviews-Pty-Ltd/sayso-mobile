import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../components/Typography';
import { APP_PAGE_GUTTER } from '../../../../styles/layout';
import { CHARCOAL, CORAL } from '../constants';
import { ProfileSectionCard } from './ProfileSectionCard';

type StatItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  description: string;
};

type Props = {
  helpfulVotesCount: number;
  reviewsCount: number;
  badgesCount: number;
  interestsCount: number;
  savedBusinessesCount: number;
  onViewSaved: () => void;
};

function StatItem({ icon, label, value, description }: StatItemProps) {
  return (
    <ProfileSectionCard style={styles.statCard} noHorizontalMargin>
      <View style={styles.statTitleRow}>
        <View style={styles.statIconWrap}>
          <Ionicons name={icon} size={14} color="rgba(45,45,45,0.85)" />
        </View>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statDescription}>{description}</Text>
    </ProfileSectionCard>
  );
}

export function ProfileStatsGrid({
  helpfulVotesCount,
  reviewsCount,
  badgesCount,
  interestsCount,
  savedBusinessesCount,
  onViewSaved,
}: Props) {
  return (
    <View style={styles.statsGrid}>
      <StatItem
        icon="thumbs-up-outline"
        label="Helpful votes"
        value={helpfulVotesCount}
        description="Received"
      />
      <StatItem
        icon="star-outline"
        label="Reviews"
        value={reviewsCount}
        description="Total written"
      />
      <StatItem
        icon="ribbon-outline"
        label="Badges"
        value={badgesCount}
        description="Achievements unlocked"
      />
      <StatItem
        icon="eye-outline"
        label="Interests"
        value={interestsCount}
        description="Communities followed"
      />

      <ProfileSectionCard style={styles.savedStatCard} noHorizontalMargin>
        <View style={styles.statTitleRow}>
          <View style={styles.statIconWrap}>
            <Ionicons name="bookmark-outline" size={14} color="rgba(45,45,45,0.85)" />
          </View>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
        <Text style={styles.statValue}>{savedBusinessesCount}</Text>
        <Text style={styles.statDescription}>
          {savedBusinessesCount > 0 ? `${savedBusinessesCount} businesses` : 'Your saved gems'}
        </Text>

        <Pressable style={styles.inlineLink} onPress={onViewSaved}>
          <Text style={styles.inlineLinkText}>View saved</Text>
          <Ionicons name="chevron-forward-outline" size={14} color={CORAL} />
        </Pressable>
      </ProfileSectionCard>
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    marginHorizontal: APP_PAGE_GUTTER,
    marginTop: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48.4%',
    padding: 14,
  },
  statTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(229,224,229,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(45,45,45,0.72)',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    lineHeight: 28,
    color: CHARCOAL,
    fontWeight: '700',
  },
  statDescription: {
    marginTop: 4,
    fontSize: 11,
    color: 'rgba(45,45,45,0.62)',
  },
  savedStatCard: {
    width: '100%',
    padding: 14,
    marginTop: 2,
  },
  inlineLink: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  inlineLinkText: {
    color: CORAL,
    fontSize: 12,
    fontWeight: '700',
  },
});
