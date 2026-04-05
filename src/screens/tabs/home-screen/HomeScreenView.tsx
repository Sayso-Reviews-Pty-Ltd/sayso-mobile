import { memo, useState } from 'react';
import {
  FlatList,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import type { BusinessListItemDto, TopReviewerDto } from '@sayso/contracts';
import { ScreenLayout } from '../../../components/ScreenLayout';
import { HeaderDmBellActions } from '../../../components/HeaderDmBellActions';
import { TransitionItem } from '../../../components/motion/TransitionItem';
import { ScreenTransitionScope } from '../../../components/motion/TransitionScope';
import { Text } from '../../../components/Typography';
import { HomeSearchBar } from '../home/HomeSearchBar';
import { HomeSearchResults } from '../home/HomeSearchResults';
import { HomeSearchSuggestions } from '../home/HomeSearchSuggestions';
import { getOverlayShadowStyle } from '../../../styles/overlayShadow';
import { CARD_CTA_RADIUS } from '../../../styles/radii';
import { HomeFeedBody } from './components/HomeFeedBody';
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
    <ScreenLayout edges={['top', 'left', 'right']} style={styles.container}>
      <View
        style={[
          styles.headerWrap,
          headerCollapsed ? styles.headerWrapCollapsed : styles.headerWrapExpanded,
        ]}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        {headerCollapsed ? (
          <View
            pointerEvents="none"
            style={[styles.headerMaterial, styles.headerMaterialCollapsed]}
          />
        ) : null}
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
        <View
          style={[
            styles.searchBarWrap,
            headerCollapsed ? styles.searchBarWrapCollapsed : styles.searchBarWrapExpanded,
          ]}
        >
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
        <HomeFeedBody
          homeFeedRef={homeFeedRef}
          user={user}
          refreshing={refreshing}
          handleRefresh={handleRefresh}
          handleScroll={handleScroll}
          ctaShadowStyle={ctaShadowStyle}
          forYou={forYou}
          trending={trending}
          events={events}
          reviewers={reviewers}
          recentReviews={recentReviews}
          featured={featured}
          navigateToReviewer={navigateToReviewer}
          onNavigateForYou={onNavigateForYou}
          onNavigateTrending={onNavigateTrending}
          onNavigateEvents={onNavigateEvents}
          onNavigateLeaderboardContributors={onNavigateLeaderboardContributors}
          onNavigateLeaderboardBusinesses={onNavigateLeaderboardBusinesses}
          onNavigateBadges={onNavigateBadges}
          onNavigateOnboarding={onNavigateOnboarding}
        />
      )}
    </ScreenLayout>
  );
}

export const HomeScreenView = memo(HomeScreenViewComponent);
