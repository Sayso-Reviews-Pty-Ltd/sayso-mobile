import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  InteractionManager,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StatusBar,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { EmptyState } from '../../components/EmptyState';
import { LoadingCrossfade } from '../../components/LoadingCrossfade';
import { BusinessScreenSkeleton } from '../../components/business-detail';
import {
  normalizeBusinessImages,
  normalizeBusinessRating,
  normalizeCategoryText,
  normalizeDescriptionText,
  normalizeLocationText,
} from '../../components/business-detail/utils';
import { useBusinessDetail } from '../../hooks/useBusinessDetail';
import { useGlobalScrollToTop } from '../../hooks/useGlobalScrollToTop';
import { useRealtimeQueryInvalidation } from '../../hooks/useRealtimeQueryInvalidation';
import { useSavedBusinesses } from '../../hooks/useSavedBusinesses';
import { useAuthSession } from '../../hooks/useSession';
import { markFirstContentful, markInteractive, markScreenReady } from '../../lib/perf/perfMarkers';
import { routes } from '../../navigation/routes';
import { businessDetailColors } from '../../components/business-detail/styles';
import { styles } from './business-screen/businessScreenStyles';
import { BusinessScreenContent } from './business-screen/BusinessScreenContent';
import { useBusinessScreenActions } from './business-screen/useBusinessScreenActions';

type Props = {
  initialTab?: 'overview' | 'reviews';
};

export default function BusinessScreen({ initialTab }: Props) {
  const insets = useSafeAreaInsets();
  const { id, newReviewId } = useLocalSearchParams<{ id: string; newReviewId?: string }>();
  const router = useRouter();
  const { user } = useAuthSession();
  const savedQuery = useSavedBusinesses();

  const {
    data: business,
    isLoading,
    isError,
    error: businessError,
    refetch: refetchBusiness,
  } = useBusinessDetail(id);

  const realtimeTargets = useMemo(
    () => [
      {
        key: `business-detail-${id}`,
        table: 'businesses',
        filter: `id=eq.${id}`,
        queryKeys: [['business', id]],
        enabled: Boolean(id),
      },
      {
        key: `business-reviews-${id}`,
        table: 'reviews',
        filter: `business_id=eq.${id}`,
        queryKeys: [['business', id]],
        enabled: Boolean(id),
      },
    ],
    [id]
  );

  useRealtimeQueryInvalidation(realtimeTargets);

  const images = useMemo(() => (business ? normalizeBusinessImages(business) : []), [business]);
  const ratingMeta = useMemo(() => (business ? normalizeBusinessRating(business) : { rating: 0, reviewCount: 0 }), [business]);
  const categoryText = useMemo(() => (business ? normalizeCategoryText(business) : 'Business'), [business]);
  const locationText = useMemo(() => (business ? normalizeLocationText(business) : 'Cape Town'), [business]);
  const descriptionText = useMemo(() => (business ? normalizeDescriptionText(business) : ''), [business]);

  const savedBusinessIds = useMemo(() => {
    const ids = ((savedQuery.data?.businesses ?? []) as Array<{ id?: string | null }>)
      .map((savedItem: { id?: string | null }) => savedItem?.id)
      .filter(
        (savedId: string | null | undefined): savedId is string =>
          typeof savedId === 'string' && savedId.trim().length > 0
      );
    return new Set(ids);
  }, [savedQuery.data?.businesses]);

  const isBusinessSaved = Boolean(business?.id && savedBusinessIds.has(business.id));

  useEffect(() => {
    if (business && !isLoading) {
      const markerKey = `business:${business.id}`;
      markFirstContentful(markerKey);
      markInteractive(markerKey);
    }
  }, [business, isLoading]);

  useEffect(() => {
    if (!isLoading && business != null) {
      markScreenReady('business-detail');
    }
  }, [business, isLoading]);

  const {
    saveError,
    setSaveError,
    handleBack,
    handleOpenNotifications,
    handleOpenMessages,
    headerRightActions,
    handleLeaveReview,
  } = useBusinessScreenActions({ business, savedQuery, savedBusinessIds, isBusinessSaved });

  const isBusinessOwner = Boolean(user && business?.owner_id && user.id === business.owner_id);

  const scrollRef = useRef<ScrollView | null>(null);
  const scrollTopVisibleRef = useRef(false);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const reviewsSectionYRef = useRef(0);
  const hasScrolledToReviewsRef = useRef(false);

  const setScrollTopVisible = useCallback((visible: boolean) => {
    if (scrollTopVisibleRef.current === visible) return;
    scrollTopVisibleRef.current = visible;
    setShowScrollTopButton(visible);
  }, []);

  const handleScrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  useGlobalScrollToTop({
    visible: showScrollTopButton,
    enabled: true,
    onScrollToTop: handleScrollToTop,
  });

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      setScrollTopVisible(y > 300);
    },
    [setScrollTopVisible]
  );

  // Scroll to the reviews section once after a fresh review submission.
  // Uses InteractionManager so the scroll fires after the layout wave settles
  // (including async sections above the reviews). Clears the URL param
  // afterward to prevent re-triggering on back-navigation.
  useEffect(() => {
    if (!newReviewId || isLoading || hasScrolledToReviewsRef.current) return;
    const handle = InteractionManager.runAfterInteractions(() => {
      if (reviewsSectionYRef.current > 0) {
        hasScrolledToReviewsRef.current = true;
        scrollRef.current?.scrollTo({ y: Math.max(0, reviewsSectionYRef.current - 16), animated: true });
        router.setParams({ newReviewId: undefined } as never);
      }
    });
    return () => handle.cancel();
  }, [newReviewId, isLoading, router]);

  if (!isLoading && !business) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="light-content" backgroundColor={businessDetailColors.coral} />
        <View style={[styles.topChrome, { height: insets.top }]} />
        <EmptyState
          icon="alert-circle"
          title="Business not found"
          message="This business may no longer be available."
          actionLabel="Go home"
          onAction={() => router.replace(routes.home() as never)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={businessDetailColors.coral} />
      <View style={[styles.topChrome, { height: insets.top }]} />
      <LoadingCrossfade
        loading={isLoading}
        skeleton={<BusinessScreenSkeleton />}
        fillContainer
      >
        {business ? (
          <BusinessScreenContent
            scrollRef={scrollRef}
            reviewsSectionYRef={reviewsSectionYRef}
            onScroll={handleScroll}
            business={business}
            images={images}
            ratingMeta={ratingMeta}
            categoryText={categoryText}
            locationText={locationText}
            descriptionText={descriptionText}
            isError={isError}
            businessError={businessError instanceof Error ? businessError : null}
            onRefetchBusiness={() => { void refetchBusiness(); }}
            saveError={saveError}
            onDismissSaveError={() => setSaveError(null)}
            headerRightActions={headerRightActions}
            isBusinessOwner={isBusinessOwner}
            initialTab={initialTab}
            newReviewId={newReviewId}
            onPressBack={handleBack}
            onPressNotifications={handleOpenNotifications}
            onPressMessages={handleOpenMessages}
            onPressLeaveReview={() => { if (business) handleLeaveReview(business.id); }}
          />
        ) : null}
      </LoadingCrossfade>
    </SafeAreaView>
  );
}
