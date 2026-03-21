import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { BusinessPageHeader } from '../../components/business-detail/BusinessPageHeader';
import { businessDetailColors } from '../../components/business-detail/styles';
import { TransitionItem } from '../../components/motion/TransitionItem';
import { ScreenTransitionScope } from '../../components/motion/TransitionScope';
import { routes } from '../../navigation/routes';
import { ContributorsSection } from './leaderboard/ContributorsSection';
import { BusinessesSection } from './leaderboard/BusinessesSection';
import { LeaderboardBadgeSection } from './leaderboard/LeaderboardBadgeSection';
import { LeaderboardHero } from './leaderboard/LeaderboardHero';
import { LeaderboardTabSwitcher } from './leaderboard/LeaderboardTabSwitcher';
import { styles } from './leaderboard/styles';
import { useLeaderboardController } from './leaderboard/useLeaderboardController';

export default function LeaderboardScreen() {
  const params = useLocalSearchParams<{ tab?: 'contributors' | 'businesses' }>();
  const router = useRouter();
  const {
    activeTab,
    availableInterestIds,
    handleScroll,
    handleTabChange,
    loadingBusinesses,
    loadingReviewers,
    refetchReviewers,
    reviewers,
    reviewersError,
    scrollRef,
    selectedInterest,
    setSelectedInterest,
    setShowAllBusinesses,
    setShowAllContributors,
    showAllBusinesses,
    showAllContributors,
    sortedBusinesses,
    visibleBusinesses,
    visibleContributors,
  } = useLeaderboardController(params.tab);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(routes.home() as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        style={[
          styles.stickyHeader,
          {
            backgroundColor: businessDetailColors.coral,
            elevation: 8,
            shadowOpacity: 0.12,
          },
        ]}
      >
        <BusinessPageHeader
          onPressBack={handleBack}
          onPressNotifications={() => router.push(routes.notifications() as never)}
          onPressMessages={() => router.push(routes.dmInbox() as never)}
          collapsed={true}
        />
      </View>

      <ScreenTransitionScope>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <TransitionItem variant="header" index={0}>
            <LeaderboardHero />
          </TransitionItem>

          <TransitionItem variant="input" index={1}>
            <LeaderboardTabSwitcher activeTab={activeTab} onChangeTab={handleTabChange} />
          </TransitionItem>

          <TransitionItem variant="card" index={2}>
            <View style={styles.card}>
              {activeTab === 'contributors' ? (
                <ContributorsSection
                  hasError={Boolean(reviewersError)}
                  isLoading={loadingReviewers}
                  onRetry={() => {
                    void refetchReviewers();
                  }}
                  onToggleShowAll={() => setShowAllContributors((visible) => !visible)}
                  reviewers={reviewers}
                  showAll={showAllContributors}
                  visibleReviewers={visibleContributors}
                />
              ) : (
                <BusinessesSection
                  availableInterestIds={availableInterestIds}
                  isLoading={loadingBusinesses}
                  onSelectInterest={setSelectedInterest}
                  onToggleShowAll={() => setShowAllBusinesses((visible) => !visible)}
                  selectedInterest={selectedInterest}
                  showAll={showAllBusinesses}
                  sortedBusinesses={sortedBusinesses}
                  visibleBusinesses={visibleBusinesses}
                />
              )}
            </View>
          </TransitionItem>

          <TransitionItem variant="cta" index={3}>
            <LeaderboardBadgeSection />
          </TransitionItem>
        </ScrollView>
      </ScreenTransitionScope>
    </SafeAreaView>
  );
}
