import { memo, useState } from 'react';
import {
  Animated,
  FlatList,
  RefreshControl,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BusinessListItemDto, TopReviewerDto } from '@sayso/contracts';
import { HeaderDmBellActions } from '../../../components/HeaderDmBellActions';
import { TransitionItem } from '../../../components/motion/TransitionItem';
import { ScreenTransitionScope } from '../../../components/motion/TransitionScope';
import { Text } from '../../../components/Typography';
import { HomeBusinessRow } from '../home/HomeBusinessRow';
import { HomeCommunityHighlightsSection } from '../home/HomeCommunityHighlightsSection';
import { HomeEventsSpecialsRow } from '../home/HomeEventsSpecialsRow';
import { HomeSearchBar } from '../home/HomeSearchBar';
import { HomeSearchResults } from '../home/HomeSearchResults';
import { HomeSearchSuggestions } from '../home/HomeSearchSuggestions';
import { HomeSectionHeader } from '../home/HomeSectionHeader';
import { getOverlayShadowStyle } from '../../../styles/overlayShadow';
import { CARD_CTA_RADIUS } from '../../../styles/radii';
import { ForYouSection } from './components/ForYouSection';
import { styles } from './HomeScreenView.styles';

const ctaShadowStyle = getOverlayShadowStyle(CARD_CTA_RADIUS);

type Props = {
  user: { id: string } | null;
  homeFeedRef: React.RefObject<ScrollView | null>;
  searchResultsRef: React.RefObject<FlatList<BusinessListItemDto> | null>;
  isSearchActive: boolean;
  searchInput: string;
  setSearchInput: (v: string) => void;
  searchIsFetching: boolean;
  searchBusinesses: BusinessListItemDto[];
  searchIsLoading: boolean;
  searchError: string | null;
  debouncedQuery: string;
  minRating: number | null;
  distanceKm: number | null;
  locationDenied: boolean;
  setMinRating: (v: number | null) => void;
  setDistanceKm: (v: number | null) => void;
  setLocationDenied: (v: boolean) => void;
  handleDistanceChange: (v: number | null) => Promise<void>;
  handleRefresh: () => Promise<void>;
  refreshing: boolean;
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  headerCollapsed: boolean;
  forYou: {
    businesses: BusinessListItemDto[];
    isLoading: boolean;
    error: string | null;
  };
  trending: {
    data: { businesses: BusinessListItemDto[] } | undefined;
    isLoading: boolean;
    error: Error | null;
  };
  events: {
    items: any[];
    isLoading: boolean;
    error: string | null;
  };
  reviewers: {
    reviewers: TopReviewerDto[];
    mode: 'stage1' | 'normal';
    isLoading: boolean;
    error: string | null;
  };
  recentReviews: {
    reviews: any[];
    isLoading: boolean;
    error: string | null;
  };
  featured: {
    featuredBusinesses: any[];
    isLoading: boolean;
    error: string | null;
  };
  activeFilterCount: number;
  onSelectSuggestion: (businessId: string) => void;
  navigateToReviewer: (reviewer: TopReviewerDto) => void;
  onNavigateForYou: () => void;
  onNavigateTrending: () => void;
  onNavigateEvents: () => void;
  onNavigateLeaderboardContributors: () => void;
  onNavigateLeaderboardBusinesses: () => void;
  onNavigateBadges: () => void;
  onNavigateOnboarding: () => void;
};

function HomeScreenViewComponent({
  user,
  homeFeedRef,
  searchResultsRef,
  isSearchActive,
  searchInput,
  setSearchInput,
  searchIsFetching,
  searchBusinesses,
  searchIsLoading,
  searchError,
  debouncedQuery,
  minRating,
  distanceKm,
  locationDenied,
  setMinRating,
  setDistanceKm,
  setLocationDenied,
  handleDistanceChange,
  handleRefresh,
  refreshing,
  handleScroll,
  headerCollapsed,
  forYou,
  trending,
  events,
  reviewers,
  recentReviews,
  featured,
  activeFilterCount,
  onSelectSuggestion,
  navigateToReviewer,
  onNavigateForYou,
  onNavigateTrending,
  onNavigateEvents,
  onNavigateLeaderboardContributors,
  onNavigateLeaderboardBusinesses,
  onNavigateBadges,
  onNavigateOnboarding,
}: Props) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [dismissedSuggestionsQuery, setDismissedSuggestionsQuery] = useState<string | null>(null);
  const normalizedSearchInput = searchInput.trim();
  const showSuggestions =
    searchFocused &&
    normalizedSearchInput.length >= 2 &&
    dismissedSuggestionsQuery !== normalizedSearchInput;

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={[
          styles.headerWrap,
          headerCollapsed ? styles.headerWrapCollapsed : styles.headerWrapExpanded,
        ]}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        {headerCollapsed ? <View pointerEvents="none" style={[styles.headerMaterial, styles.headerMaterialCollapsed]} /> : null}
        <View
          pointerEvents={headerCollapsed ? 'none' : 'auto'}
          style={[
            styles.headerRowWrap,
            headerCollapsed ? styles.headerRowWrapCollapsed : styles.headerRowWrapExpanded,
          ]}
        >
          <TransitionItem role="hero" index={0}>
            <View style={styles.headerRow}>
              <View style={styles.headerCopy}>
                <Text style={styles.headerTitle}>Sayso</Text>
              </View>
              <HeaderDmBellActions />
            </View>
          </TransitionItem>
        </View>
        <View style={[styles.searchBarWrap, headerCollapsed ? styles.searchBarWrapCollapsed : styles.searchBarWrapExpanded]}>
          <TransitionItem role="subheading" index={1}>
            <HomeSearchBar
              value={searchInput}
              onChangeText={(value) => {
                setSearchInput(value);
                if (dismissedSuggestionsQuery && value.trim() !== dismissedSuggestionsQuery) {
                  setDismissedSuggestionsQuery(null);
                }
              }}
              onClear={() => {
                setSearchInput('');
                setSearchFocused(false);
                setDismissedSuggestionsQuery(null);
              }}
              isFetching={isSearchActive && searchIsFetching}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 100)}
              activeFilterCount={activeFilterCount}
            />
          </TransitionItem>
        </View>
      </View>

      {showSuggestions ? (
        <View
          style={[styles.suggestionsOverlay, { top: headerHeight + 8 }]}
          pointerEvents="box-none"
        >
          <HomeSearchSuggestions
            query={searchInput}
            onSelect={(id) => {
              setSearchFocused(false);
              onSelectSuggestion(id);
            }}
            onSelectQuery={(q) => {
              setSearchFocused(false);
              setSearchInput(q);
            }}
            onClose={() => setDismissedSuggestionsQuery(normalizedSearchInput)}
          />
        </View>
      ) : null}

      {isSearchActive ? (
        <ScreenTransitionScope>
          <TransitionItem role="support" index={2} style={styles.flexOne}>
            <HomeSearchResults
              listRef={searchResultsRef}
              query={debouncedQuery}
              results={searchBusinesses}
              isLoading={searchIsLoading}
              error={searchError}
              minRating={minRating}
              distanceKm={distanceKm}
              locationDenied={locationDenied}
              onSetMinRating={(value) => setMinRating(value)}
              onSetDistanceKm={handleDistanceChange}
              onClearFilters={() => {
                setMinRating(null);
                setDistanceKm(null);
                setLocationDenied(false);
              }}
              onRefresh={() => {
                void handleRefresh();
              }}
              refreshing={refreshing}
              onScroll={handleScroll}
            />
          </TransitionItem>
        </ScreenTransitionScope>
      ) : (
        <ScreenTransitionScope>
          <Animated.ScrollView
            ref={homeFeedRef}
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void handleRefresh()} />}
            contentContainerStyle={styles.content}
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
      )}
    </SafeAreaView>
  );
}

export const HomeScreenView = memo(HomeScreenViewComponent);
