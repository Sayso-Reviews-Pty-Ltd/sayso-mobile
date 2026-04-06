import { Animated, RefreshControl, ScrollView, View } from 'react-native';
import type { BusinessListItemDto, TopReviewerDto } from '@sayso/contracts';
import { ScreenTransitionScope } from '../../../../components/motion/TransitionScope';
import { TransitionItem } from '../../../../components/motion/TransitionItem';
import { useBottomScreenSpacing } from '../../../../hooks/useBottomScreenSpacing';
import { HomeBusinessRow } from '../../home/HomeBusinessRow';
import { HomeCommunityHighlightsSection } from '../../home/HomeCommunityHighlightsSection';
import { HomeEventsSpecialsRow } from '../../home/HomeEventsSpecialsRow';
import { HomeSectionHeader } from '../../home/HomeSectionHeader';
import { styles } from '../HomeScreenView.styles';
import { ForYouSection } from './ForYouSection';
import { type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  homeFeedRef: React.RefObject<ScrollView | null>;
  user: { id: string } | null;
  refreshing: boolean;
  handleRefresh: () => Promise<void>;
  handleScroll: (
    event: import('react-native').NativeSyntheticEvent<import('react-native').NativeScrollEvent>,
  ) => void;
  ctaShadowStyle: StyleProp<ViewStyle>;
  forYou: { businesses: BusinessListItemDto[]; isLoading: boolean; error: string | null };
  trending: {
    data: { businesses: BusinessListItemDto[] } | undefined;
    isLoading: boolean;
    error: Error | null;
  };
  events: { items: any[]; isLoading: boolean; error: string | null };
  reviewers: {
    reviewers: TopReviewerDto[];
    mode: 'stage1' | 'normal';
    isLoading: boolean;
    error: string | null;
  };
  recentReviews: { reviews: any[]; isLoading: boolean; error: string | null };
  featured: { featuredBusinesses: any[]; isLoading: boolean; error: string | null };
  navigateToReviewer: (reviewer: TopReviewerDto) => void;
  onNavigateForYou: () => void;
  onNavigateTrending: () => void;
  onNavigateEvents: () => void;
  onNavigateLeaderboardContributors: () => void;
  onNavigateLeaderboardBusinesses: () => void;
  onNavigateBadges: () => void;
  onNavigateOnboarding: () => void;
};

export function HomeFeedBody({
  homeFeedRef,
  user,
  refreshing,
  handleRefresh,
  handleScroll,
  ctaShadowStyle,
  forYou,
  trending,
  events,
  reviewers,
  recentReviews,
  featured,
  navigateToReviewer,
  onNavigateForYou,
  onNavigateTrending,
  onNavigateEvents,
  onNavigateLeaderboardContributors,
  onNavigateLeaderboardBusinesses,
  onNavigateBadges,
  onNavigateOnboarding,
}: Props) {
  const bottomSpacing = useBottomScreenSpacing(true);

  return (
    <ScreenTransitionScope>
      <Animated.ScrollView
        ref={homeFeedRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void handleRefresh()} />
        }
        contentContainerStyle={[styles.content, { paddingBottom: bottomSpacing }]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <TransitionItem role="support" index={3}>
          <ForYouSection
            user={user}
            forYou={forYou}
            onNavigateForYou={onNavigateForYou}
            onNavigateOnboarding={onNavigateOnboarding}
            ctaShadowStyle={ctaShadowStyle}
          />
        </TransitionItem>

        <TransitionItem role="support" index={4}>
          <View style={styles.section}>
            <HomeSectionHeader
              title="Trending Now"
              actionLabel="See More"
              onPress={onNavigateTrending}
            />
            <HomeBusinessRow
              items={trending.data?.businesses ?? []}
              loading={trending.isLoading}
              error={trending.error instanceof Error ? trending.error.message : null}
              emptyTitle="Nothing trending yet"
              emptyMessage="Check back soon for live activity."
            />
          </View>
        </TransitionItem>

        <TransitionItem role="support" index={5}>
          <View style={styles.section}>
            <HomeSectionHeader
              title="Events & Specials"
              actionLabel="See More"
              onPress={onNavigateEvents}
            />
            <HomeEventsSpecialsRow
              items={events.items}
              loading={events.isLoading}
              error={events.error}
            />
          </View>
        </TransitionItem>

        <TransitionItem role="support" index={6}>
          <HomeCommunityHighlightsSection
            reviewers={reviewers.reviewers}
            reviewersMode={reviewers.mode}
            recentReviews={recentReviews.reviews}
            reviewersLoading={reviewers.isLoading || recentReviews.isLoading}
            reviewersError={reviewers.error ?? recentReviews.error}
            featuredBusinesses={featured.featuredBusinesses}
            featuredLoading={featured.isLoading}
            featuredError={featured.error}
            onPressContributors={onNavigateLeaderboardContributors}
            onPressFeatured={onNavigateLeaderboardBusinesses}
            onPressBadges={onNavigateBadges}
            onPressReviewer={navigateToReviewer}
          />
        </TransitionItem>
      </Animated.ScrollView>
    </ScreenTransitionScope>
  );
}
