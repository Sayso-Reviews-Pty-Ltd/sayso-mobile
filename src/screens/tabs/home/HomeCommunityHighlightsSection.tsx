import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import type { FeaturedBusinessDto, RecentReviewDto, TopReviewerDto } from '@sayso/contracts';
import { CardSurface } from '../../../components/CardSurface';
import { Text } from '../../../components/Typography';
import { HomeSectionHeader } from './HomeSectionHeader';
import { HomeBusinessRow } from './HomeBusinessRow';
import { homeTokens } from './HomeTokens';

type Props = {
  reviewers: TopReviewerDto[];
  recentReviews: RecentReviewDto[];
  reviewersLoading: boolean;
  reviewersError?: string | null;
  featuredBusinesses: FeaturedBusinessDto[];
  featuredLoading: boolean;
  featuredError?: string | null;
  onPressContributors: () => void;
  onPressFeatured: () => void;
  onPressReviewer: (reviewer: TopReviewerDto) => void;
};

function ContributorCard({
  reviewer,
  review,
  onPress,
}: {
  reviewer: TopReviewerDto;
  review?: RecentReviewDto;
  onPress: () => void;
}) {
  return (
    <CardSurface
      radius={22}
      style={styles.reviewerCard}
      contentStyle={styles.reviewerCardContent}
      interactive
      onPress={onPress}
    >
      <View style={styles.reviewerHeader}>
        <Image source={{ uri: reviewer.profilePicture || undefined }} style={styles.avatar} contentFit="cover" />
        <View style={styles.reviewerCopy}>
          <Text numberOfLines={1} style={styles.reviewerName}>
            {reviewer.name}
          </Text>
          <Text numberOfLines={1} style={styles.reviewerMeta}>
            {reviewer.reviewCount} reviews
          </Text>
        </View>
      </View>
      <Text numberOfLines={3} style={styles.reviewerSnippet}>
        {review?.reviewText ?? 'Write your first review and help shape what is worth discovering.'}
      </Text>
    </CardSurface>
  );
}

export function HomeCommunityHighlightsSection({
  reviewers,
  recentReviews,
  reviewersLoading,
  reviewersError,
  featuredBusinesses,
  featuredLoading,
  featuredError,
  onPressContributors,
  onPressFeatured,
  onPressReviewer,
}: Props) {
  return (
    <View style={styles.section}>
      <HomeSectionHeader title="Community Highlights" />

      <View style={styles.subsection}>
        <View style={styles.subsectionTop}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Top Contributors</Text>
          </View>
          <TouchableOpacity onPress={onPressContributors} activeOpacity={0.8}>
            <Text style={styles.subsectionAction}>See More</Text>
          </TouchableOpacity>
        </View>

        {reviewersLoading ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.row}
            contentContainerStyle={styles.rowContent}
          >
            {[1, 2, 3].map((item) => (
              <CardSurface
                key={`reviewer-skeleton-${item}`}
                radius={22}
                style={styles.reviewerCard}
                contentStyle={styles.reviewerCardContent}
              >
                <View style={styles.reviewerCardSkeleton} />
              </CardSurface>
            ))}
          </ScrollView>
        ) : reviewersError ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>Top contributors are unavailable right now.</Text>
            <Text style={styles.messageText}>{reviewersError}</Text>
          </View>
        ) : reviewers.length === 0 ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>Be among the first voices shaping Sayso.</Text>
            <Text style={styles.messageText}>
              Write your first review and help set the standard for what is worth discovering.
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.row}
            contentContainerStyle={styles.rowContent}
          >
            {reviewers.map((reviewer) => {
              const review = recentReviews.find((item) => item.reviewer.id === reviewer.id);
              return (
                <ContributorCard
                  key={reviewer.id}
                  reviewer={reviewer}
                  review={review}
                  onPress={() => onPressReviewer(reviewer)}
                />
              );
            })}
          </ScrollView>
        )}
      </View>

      <View style={styles.subsection}>
        <View style={styles.subsectionTop}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Featured Businesses</Text>
          </View>
          <TouchableOpacity onPress={onPressFeatured} activeOpacity={0.8}>
            <Text style={styles.subsectionAction}>See More</Text>
          </TouchableOpacity>
        </View>

        <HomeBusinessRow
          items={featuredBusinesses}
          loading={featuredLoading}
          error={featuredError}
          emptyTitle="Curated by trust and completeness."
          emptyMessage="As the community grows, this will highlight rising businesses worth exploring."
          contentPaddingBottom={0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingTop: 18,
    paddingBottom: 0,
    backgroundColor: homeTokens.offWhite,
  },
  subsection: {
    marginTop: 4,
    marginBottom: 18,
    backgroundColor: homeTokens.offWhite,
  },
  subsectionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: homeTokens.sageWash,
    borderWidth: 1,
    borderColor: 'rgba(125, 155, 118, 0.28)',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: homeTokens.sageDark,
  },
  subsectionAction: {
    fontSize: 14,
    fontWeight: '600',
    color: homeTokens.charcoal,
  },
  row: {
    overflow: 'visible',
    backgroundColor: homeTokens.offWhite,
  },
  rowContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 18,
    gap: 14,
    backgroundColor: homeTokens.offWhite,
  },
  reviewerCard: {
    width: 248,
  },
  reviewerCardContent: {
    minHeight: 180,
    padding: 16,
  },
  reviewerCardSkeleton: {
    flex: 1,
    minHeight: 148,
  },
  reviewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: homeTokens.lightGray,
  },
  reviewerCopy: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '700',
    color: homeTokens.charcoal,
  },
  reviewerMeta: {
    fontSize: 13,
    color: homeTokens.textSecondary,
    marginTop: 2,
  },
  reviewerSnippet: {
    fontSize: 14,
    lineHeight: 20,
    color: homeTokens.textSecondary,
    marginTop: 14,
  },
  messageCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: homeTokens.borderSoft,
    backgroundColor: homeTokens.white,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: homeTokens.charcoal,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: homeTokens.textSecondary,
    marginTop: 6,
  },
});
