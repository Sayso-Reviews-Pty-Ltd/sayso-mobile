import { useRef } from 'react';
import { Pressable, RefreshControl, ScrollView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LoadingCrossfade } from '../../components/LoadingCrossfade';
import { Text } from '../../components/Typography';
import { TransitionItem } from '../../components/motion/TransitionItem';
import { ScreenTransitionScope } from '../../components/motion/TransitionScope';
import { StackPageHeader } from '../../components/StackPageHeader';
import { useAuthSession } from '../../hooks/useSession';
import { routes } from '../../navigation/routes';
import { BREAKPOINT_SM, BREAKPOINT_MD, ITEMS_PER_PAGE, resolveGridColumns } from './saved-screen/savedScreenTokens';
import { styles } from './saved-screen/savedScreenStyles';
import { useSavedScreenState } from './saved-screen/useSavedScreenState';
import { EmptySavedState } from './saved/components/EmptySavedState';
import { SavedFilterPillGroup } from './saved/components/SavedFilterPillGroup';
import { SavedGrid } from './saved/components/SavedGrid';
import { SavedPageSkeleton } from './saved/components/SavedPageSkeleton';
import { SavedPagination } from './saved/components/SavedPagination';

export default function SavedScreen() {
  const router = useRouter();
  const { user } = useAuthSession();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView | null>(null);

  const isSmUp = width >= BREAKPOINT_SM;
  const isMdUp = width >= BREAKPOINT_MD;
  const gridColumns = resolveGridColumns(width);
  const gridGap = isSmUp ? 12 : 16;
  const headingFontSize = isMdUp ? 36 : isSmUp ? 30 : 24;
  const titleSectionMarginBottom = isSmUp ? 32 : 24;
  const pillHorizontalPadding = isSmUp ? 16 : 12;
  const pillFontSize = isSmUp ? 14 : 12;

  const {
    savedQuery, isLoading, errorMessage,
    categories, filteredBusinesses, totalPages, paginatedRows, filterOptions,
    hasAnyContent, totalSavedCount,
    currentPage, isPaginationLoading, selectedCategory, setSelectedCategory,
    handleScroll, handlePageChange, handleRefetch,
  } = useSavedScreenState({ width, gridColumns, scrollRef, hasUser: Boolean(user) });

  if (!user) return null;

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
      <StackPageHeader navigation={{ canGoBack: () => false, goBack: () => {} }} showBackButton={false} />

      <ScreenTransitionScope>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={<RefreshControl refreshing={savedQuery.isRefetching} onRefresh={handleRefetch} />}
        >
          <LoadingCrossfade
            loading={isLoading}
            skeleton={<SavedPageSkeleton columnCount={gridColumns} gridGap={gridGap} />}
          >
            {errorMessage ? (
              <TransitionItem role="support" index={1}>
                <View style={styles.errorWrap}>
                  <View style={styles.errorInner}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                    <Pressable style={styles.retryButton} onPress={handleRefetch}>
                      <Text style={styles.retryButtonText}>Try Again</Text>
                    </Pressable>
                  </View>
                </View>
              </TransitionItem>
            ) : (
              <TransitionItem role="support" index={1}>
                <View style={styles.maxContainer}>
                  <View style={[styles.titleSection, { marginBottom: titleSectionMarginBottom }]}>
                    <Text style={[styles.titleHeading, { fontSize: headingFontSize }]}>Your Saved Gems</Text>
                    <Text style={styles.titleSubtitle}>
                      {hasAnyContent
                        ? `${totalSavedCount} ${totalSavedCount === 1 ? 'item' : 'items'} saved`
                        : 'Businesses you bookmark will appear here'}
                    </Text>
                  </View>

                  {hasAnyContent ? (
                    <>
                      {categories.length > 1 ? (
                        <View style={styles.filterWrap}>
                          <SavedFilterPillGroup
                            options={filterOptions}
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            pillHorizontalPadding={pillHorizontalPadding}
                            pillFontSize={pillFontSize}
                          />
                        </View>
                      ) : null}

                      <SavedGrid
                        businesses={filteredBusinesses}
                        gridColumns={gridColumns}
                        gridGap={gridGap}
                        paginatedRows={paginatedRows}
                        onPressExplore={() => router.push(routes.home() as never)}
                      />

                      {filteredBusinesses.length > ITEMS_PER_PAGE ? (
                        <View style={styles.paginationWrap}>
                          <SavedPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            disabled={isPaginationLoading}
                            onPageChange={handlePageChange}
                          />
                        </View>
                      ) : null}
                    </>
                  ) : (
                    <View style={styles.emptyStatePad}>
                      <EmptySavedState />
                    </View>
                  )}
                </View>
              </TransitionItem>
            )}
          </LoadingCrossfade>
        </ScrollView>
      </ScreenTransitionScope>

      {isPaginationLoading ? (
        <View style={styles.paginationOverlay}>
          <View style={styles.paginationOverlayInner}>
            <SavedPageSkeleton showHeader={false} columnCount={gridColumns} gridGap={gridGap} />
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
