import { useEffect, useRef } from 'react';
import { Animated as RNAnimated, FlatList, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import type { RecentReviewDto, TopReviewerDto } from '@sayso/contracts';
import { SkeletonBlock } from '../../../../components/SkeletonBlock';
import { Text } from '../../../../components/Typography';
import { ReviewerCard } from '../../../../components/reviewer-card/ReviewerCard';
import { useReducedMotion } from '../../../../hooks/useReducedMotion';
import { CommunityBadgeMarquee } from './CommunityBadgeMarquee';
import {
  FLATLIST_PERF,
  OPACITY_INACTIVE,
  REVIEWER_GAP,
  REVIEWER_SKELETONS,
  REVIEWER_SNAP_INTERVAL,
  REVIEWER_CARD_WIDTH,
  SCALE_INACTIVE,
  styles,
} from './styles';

type Props = {
  reviewers: TopReviewerDto[];
  recentReviews: RecentReviewDto[];
  reviewersMode: 'stage1' | 'normal';
  reviewersLoading: boolean;
  reviewersError?: string | null;
  onPressContributors: () => void;
  onPressBadges: () => void;
};

const AnimatedFlatList = RNAnimated.createAnimatedComponent(FlatList) as unknown as typeof FlatList;

type AnimatedCardProps = {
  scrollX: RNAnimated.Value;
  index: number;
  children: React.ReactNode;
};

function AnimatedCard({ scrollX, index, children }: AnimatedCardProps) {
  const inputRange = [
    (index - 1) * REVIEWER_SNAP_INTERVAL,
    index * REVIEWER_SNAP_INTERVAL,
    (index + 1) * REVIEWER_SNAP_INTERVAL,
  ];
  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [SCALE_INACTIVE, 1, SCALE_INACTIVE],
    extrapolate: 'clamp',
  });
  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [OPACITY_INACTIVE, 1, OPACITY_INACTIVE],
    extrapolate: 'clamp',
  });

  return <RNAnimated.View style={{ transform: [{ scale }], opacity }}>{children}</RNAnimated.View>;
}

export function ReviewerCarousel({
  reviewers,
  recentReviews,
  reviewersMode,
  reviewersLoading,
  reviewersError,
  onPressContributors,
  onPressBadges,
}: Props) {
  const contributorsHeading = reviewersMode === 'normal' ? 'Top Contributors' : 'Early Voices';
  const showContributorsAction = reviewers.length > 0 && !reviewersLoading;
  const reducedMotion = useReducedMotion();
  const reviewerScrollX = useRef(new RNAnimated.Value(0)).current;
  const onReviewerScroll = RNAnimated.event(
    [{ nativeEvent: { contentOffset: { x: reviewerScrollX } } }],
    { useNativeDriver: true }
  );

  const badgesAnim = useSharedValue(0);

  useEffect(() => {
    if (reviewers.length === 0 && !reviewersLoading && !reviewersError) {
      badgesAnim.value = withDelay(
        200,
        withTiming(1, {
          duration: 600,
          easing: Easing.out(Easing.cubic),
        })
      );
    }
  }, [reviewers.length, reviewersLoading, reviewersError, badgesAnim]);

  const badgesAnimatedStyle = useAnimatedStyle(
    () => ({
      opacity: badgesAnim.value,
      transform: [{ translateY: 10 * (1 - badgesAnim.value) }],
    }),
    []
  );

  return (
    <View style={styles.subsection}>
      <View style={styles.subsectionTop}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>{contributorsHeading}</Text>
        </View>
        {showContributorsAction ? (
          <TouchableOpacity style={styles.subsectionActionButton} onPress={onPressContributors} activeOpacity={0.8}>
            <Text style={styles.subsectionAction}>See More</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {reviewersLoading ? (
        <FlatList
          horizontal
          data={REVIEWER_SKELETONS}
          keyExtractor={(i) => `reviewer-skeleton-${i}`}
          renderItem={() => (
            <View style={styles.reviewerSkeletonCardShell}>
              <View style={styles.reviewerSkeletonTopAccent} />
              <View style={styles.reviewerCardSkeleton}>
                <SkeletonBlock style={styles.reviewerSkeletonAvatar} />
                <SkeletonBlock style={styles.reviewerSkeletonTitle} />
                <SkeletonBlock style={styles.reviewerSkeletonSub} />
                <SkeletonBlock style={styles.reviewerSkeletonLine} />
                <SkeletonBlock style={styles.reviewerSkeletonLineShort} />
                <View style={styles.reviewerSkeletonPillRow}>
                  <SkeletonBlock style={styles.reviewerSkeletonPill} />
                  <SkeletonBlock style={styles.reviewerSkeletonPill} />
                </View>
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ width: REVIEWER_GAP }} />}
          getItemLayout={(_, index) => ({
            length: REVIEWER_CARD_WIDTH,
            offset: (REVIEWER_CARD_WIDTH + REVIEWER_GAP) * index,
            index,
          })}
          showsHorizontalScrollIndicator={false}
          snapToInterval={REVIEWER_CARD_WIDTH + REVIEWER_GAP}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          style={styles.row}
          contentContainerStyle={styles.rowContent}
          {...FLATLIST_PERF}
        />
      ) : reviewersError ? (
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Top contributors are unavailable right now.</Text>
          <Text style={styles.messageText}>{reviewersError}</Text>
        </View>
      ) : reviewers.length === 0 ? (
        <View style={styles.emptyContributorsCard}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoWordmark}>Sayso</Text>
            <Animated.Text style={[styles.badgesScript, badgesAnimatedStyle]}>badges</Animated.Text>
          </View>
          <Text style={styles.emptyContributorsTitle}>Be among the first voices shaping Sayso.</Text>
          <Text style={styles.emptyContributorsBody}>
            Write your first review and help set the standard for what is worth discovering.
          </Text>
          <TouchableOpacity style={styles.exploreBadgesButton} onPress={onPressBadges} activeOpacity={0.88}>
            <Text style={styles.exploreBadgesText}>Explore badges</Text>
            <Ionicons name="arrow-forward-outline" size={15} color="#FFFFFF" />
          </TouchableOpacity>
          <CommunityBadgeMarquee />
        </View>
      ) : (
        <AnimatedFlatList
          horizontal
          data={reviewers}
          keyExtractor={(reviewer) => reviewer.id}
          renderItem={({ item: reviewer, index }) => {
            const latestReview = recentReviews.find((item) => item.reviewer.id === reviewer.id);
            const card = <ReviewerCard variant="reviewer" reviewer={reviewer} latestReview={latestReview} />;
            return reducedMotion ? card : <AnimatedCard scrollX={reviewerScrollX} index={index}>{card}</AnimatedCard>;
          }}
          ItemSeparatorComponent={() => <View style={{ width: REVIEWER_GAP }} />}
          getItemLayout={(_, index) => ({
            length: REVIEWER_CARD_WIDTH,
            offset: (REVIEWER_CARD_WIDTH + REVIEWER_GAP) * index,
            index,
          })}
          showsHorizontalScrollIndicator={false}
          snapToInterval={REVIEWER_SNAP_INTERVAL}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          onScroll={onReviewerScroll}
          scrollEventThrottle={16}
          style={styles.row}
          contentContainerStyle={styles.rowContent}
          {...FLATLIST_PERF}
        />
      )}
    </View>
  );
}
