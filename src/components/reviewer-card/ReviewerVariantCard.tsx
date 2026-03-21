import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { RecentReviewDto, TopReviewerDto } from '@sayso/contracts';
import { Text } from '../Typography';
import { Avatar } from './Avatar';
import { BadgeChip } from './BadgeChip';
import { Stars } from './Stars';
import { reviewerStyles } from './styles';
import { C } from './theme';
import type { BadgeType } from './types';

type Props = {
  reviewer: TopReviewerDto;
  latestReview?: RecentReviewDto;
  onPress: () => void;
};

export function ReviewerVariantCard({ reviewer, latestReview, onPress }: Props) {
  const isTopReviewer = reviewer.badge === 'top';
  const stats = [
    { value: reviewer.reviewCount, label: 'Reviews' },
    { value: reviewer.avgRatingGiven != null ? reviewer.avgRatingGiven.toFixed(1) : '—', label: 'Avg ★' },
    { value: reviewer.helpfulVotes ?? 0, label: 'Helpful' },
  ];

  const badgesCount = reviewer.badgesCount ?? 0;
  const primaryBadge = reviewer.badge as BadgeType | undefined;
  const extraCount = Math.max(0, badgesCount - (primaryBadge ? 1 : 0));

  return (
    <Pressable
      style={[reviewerStyles.card, { backgroundColor: C.cardBg }]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <LinearGradient
        colors={['rgba(114,47,55,0.50)', 'rgba(125,155,118,0.60)', 'rgba(114,47,55,0.30)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={reviewerStyles.accent}
      />

      <View style={reviewerStyles.body}>
        <View style={reviewerStyles.identityRow}>
          <Avatar
            src={reviewer.profilePicture}
            name={reviewer.name}
            size={48}
            badge={reviewer.badge as BadgeType}
            isTopCard={false}
          />
          <View style={reviewerStyles.identityText}>
            <Text style={[reviewerStyles.name, { color: C.charcoal }]} numberOfLines={1}>
              {reviewer.name}
            </Text>
            {isTopReviewer ? (
              <View style={reviewerStyles.topLabelRow}>
                <Ionicons name="star-outline" size={10} color={C.amber400} />
                <Text style={reviewerStyles.topLabel}>Top Reviewer</Text>
              </View>
            ) : reviewer.location ? (
              <View style={reviewerStyles.locationRow}>
                <Ionicons name="location-outline" size={10} color={C.charcoal45} />
                <Text style={reviewerStyles.location} numberOfLines={1}>
                  {reviewer.location}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={reviewerStyles.statsGrid}>
          {stats.map(({ value, label }) => (
            <View
              key={label}
              style={[reviewerStyles.statCell, { backgroundColor: C.offWhite70, borderColor: C.charcoal06 }]}
            >
              <Text style={[reviewerStyles.statValue, { color: C.charcoal }]}>{value}</Text>
              <Text style={[reviewerStyles.statLabel, { color: C.charcoal40 }]}>{label}</Text>
            </View>
          ))}
        </View>

        {(primaryBadge || extraCount > 0) && (
          <View style={reviewerStyles.badgeRow}>
            {primaryBadge ? <BadgeChip badge={primaryBadge} isTopCard={isTopReviewer} /> : null}
            {extraCount > 0 ? (
              <View style={[reviewerStyles.overflowChip, { backgroundColor: C.offWhite70, borderColor: C.charcoal06 }]}>
                <Text style={[reviewerStyles.overflowText, { color: C.charcoal60 }]}>+{extraCount}</Text>
              </View>
            ) : null}
          </View>
        )}

        {latestReview ? (
          <View style={[reviewerStyles.snippet, { backgroundColor: C.offWhite50, borderColor: C.charcoal06 }]}>
            <View style={reviewerStyles.snippetHeader}>
              <Stars rating={latestReview.rating} size={10} />
              <Text style={[reviewerStyles.snippetLatestLabel, { color: C.charcoal35 }]}>Latest</Text>
            </View>
            <Text style={[reviewerStyles.snippetText, { color: C.charcoal60 }]} numberOfLines={2}>
              {latestReview.reviewText}
            </Text>
          </View>
        ) : null}

        <View style={reviewerStyles.ctaRow}>
          <Text style={[reviewerStyles.ctaText, { color: 'rgba(125,155,118,0.65)' }]}>View profile</Text>
          <Ionicons name="chevron-forward-outline" size={12} color="rgba(125,155,118,0.65)" />
        </View>
      </View>
    </Pressable>
  );
}
