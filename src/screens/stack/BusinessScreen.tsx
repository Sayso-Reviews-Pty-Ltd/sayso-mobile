import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { haptics } from '../../lib/haptics';
import {
  Alert,
  InteractionManager,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Share,
  StatusBar,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { EmptyState } from '../../components/EmptyState';
import { Text } from '../../components/Typography';
import {
  BusinessActionCard,
  BusinessContactCard,
  BusinessContactInfoCard,
  BusinessDescriptionCard,
  BusinessDetailsCard,
  BusinessHeroCarousel,
  BusinessInfoBlock,
  BusinessLocationCard,
  BusinessOwnedEventsSection,
  BusinessPageHeader,
  type BusinessHeaderRightAction,
  BusinessPerformanceInsightsCard,
  BusinessPhotoGrid,
  BusinessReviewsSection,
  BusinessScreenSkeleton,
  PersonalizationInsightsCard,
  SimilarBusinessesSection,
} from '../../components/business-detail';
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
import { TransitionItem } from '../../components/motion/TransitionItem';
import { ScreenTransitionScope } from '../../components/motion/TransitionScope';
import { apiFetch } from '../../lib/api';
import { ENV } from '../../lib/env';
import { markFirstContentful, markInteractive, markScreenReady } from '../../lib/perf/perfMarkers';
import { routes } from '../../navigation/routes';
import { businessDetailColors } from '../../components/business-detail/styles';
import { styles } from './business-screen/businessScreenStyles';

type Props = {
  initialTab?: 'overview' | 'reviews';
};

export default function BusinessScreen({ initialTab }: Props) {
  const insets = useSafeAreaInsets();
  const { id, newReviewId } = useLocalSearchParams<{ id: string; newReviewId?: string }>();
  const router = useRouter();
  const { user } = useAuthSession();
  const savedQuery = useSavedBusinesses();
  const [saveBusy, setSaveBusy] = useState(false);

  const { data: business, isLoading, isError } = useBusinessDetail(id);

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

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(routes.home() as never);
  };

  const handleOpenNotifications = () => {
    router.push(routes.notifications() as never);
  };

  const handleOpenMessages = () => {
    router.push(routes.dmInbox() as never);
  };

  const handleShareBusiness = useCallback(async () => {
    if (!business) return;
    const origin = ENV.apiBaseUrl || 'https://www.sayso.co.za';
    const businessPath = routes.businessDetail(business.id);

    try {
      await Share.share({
        title: business.name,
        message: `Check out ${business.name} on Sayso\n${origin}${businessPath}`,
      });
    } catch {
      // Non-blocking.
    }
  }, [business]);

  const handleToggleSaveBusiness = useCallback(async () => {
    if (!business) return;
    if (!user) {
      router.push(routes.onboarding() as never);
      return;
    }
    if (saveBusy) return;

    haptics.confirm();
    setSaveBusy(true);
    try {
      if (savedBusinessIds.has(business.id)) {
        await apiFetch<{ success?: boolean; message?: string }>(`/api/user/saved?business_id=${business.id}`, {
          method: 'DELETE',
        });
      } else {
        await apiFetch<{ success?: boolean; message?: string }>('/api/user/saved', {
          method: 'POST',
          body: JSON.stringify({ business_id: business.id }),
        });
      }
      await savedQuery.refetch();
    } catch (error) {
      Alert.alert(
        'Save unavailable',
        error instanceof Error ? error.message : 'Unable to update saved items right now.'
      );
    } finally {
      setSaveBusy(false);
    }
  }, [business, router, saveBusy, savedBusinessIds, savedQuery, user]);

  const headerRightActions = useMemo<BusinessHeaderRightAction[]>(
    () => [
      {
        key: 'share',
        icon: 'share-social-outline',
        onPress: () => {
          void handleShareBusiness();
        },
        accessibilityLabel: 'Share business',
      },
      {
        key: 'save',
        icon: isBusinessSaved ? 'bookmark' : 'bookmark-outline',
        onPress: () => {
          void handleToggleSaveBusiness();
        },
        accessibilityLabel: isBusinessSaved ? 'Unsave business' : 'Save business',
        disabled: saveBusy,
      },
    ],
    [handleShareBusiness, handleToggleSaveBusiness, isBusinessSaved, saveBusy]
  );

  const handleLeaveReview = () => {
    if (!business) return;
    router.push(routes.writeReview('business', business.id) as never);
  };

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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="light-content" backgroundColor={businessDetailColors.coral} />
        <View style={[styles.topChrome, { height: insets.top }]} />
        <BusinessScreenSkeleton />
      </SafeAreaView>
    );
  }

  if (isError || !business) {
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

      <View style={[styles.stickyHeader, { backgroundColor: businessDetailColors.coral }]}>
        <BusinessPageHeader
          onPressBack={handleBack}
          onPressNotifications={handleOpenNotifications}
          onPressMessages={handleOpenMessages}
          rightActions={headerRightActions}
          menuItems={[]}
          collapsed={true}
        />
      </View>

      <ScreenTransitionScope>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
        <View style={styles.mainColumn}>
          <TransitionItem variant="card" index={0}>
            <BusinessHeroCarousel
              businessName={business.name}
              images={images}
              rating={ratingMeta.rating}
              verified={business.verified}
              subcategorySlug={business.primary_subcategory_slug ?? business.sub_interest_id ?? business.subInterestId}
              interestId={business.primary_category_slug ?? business.interest_id ?? business.interestId}
            />
          </TransitionItem>

          <TransitionItem variant="card" index={1}>
            <BusinessInfoBlock
              name={business.name}
              rating={ratingMeta.rating}
              category={categoryText}
              location={locationText}
            />
          </TransitionItem>

          <TransitionItem variant="card" index={2}>
            <BusinessDescriptionCard description={descriptionText} />
          </TransitionItem>

          <TransitionItem variant="card" index={3}>
            <BusinessDetailsCard
              priceRange={business.price_range ?? business.priceRange}
              verified={business.verified}
              hours={business.hours}
              openingHours={business.openingHours}
              opening_hours={business.opening_hours}
            />
          </TransitionItem>

          <TransitionItem variant="card" index={4} animate={false}>
            <BusinessPhotoGrid businessName={business.name} photos={images} />
          </TransitionItem>

          <TransitionItem variant="card" index={5} animate={false}>
            <BusinessLocationCard
              name={business.name}
              address={business.address}
              location={business.location}
              latitude={business.lat}
              longitude={business.lng}
            />
          </TransitionItem>

          <TransitionItem variant="card" index={6} animate={false}>
            <BusinessContactInfoCard
              phone={business.phone}
              email={business.email}
              website={business.website}
              address={business.address}
              location={business.location}
            />
          </TransitionItem>

          <TransitionItem variant="card" index={7} animate={false}>
            <BusinessActionCard
              onPressLeaveReview={handleLeaveReview}
              onPressEditBusiness={() => router.push('/role-unsupported' as never)}
              isBusinessOwner={isBusinessOwner}
            />
          </TransitionItem>

          <TransitionItem variant="card" index={8} animate={false}>
            <PersonalizationInsightsCard
              business={business}
              onPressLogin={() => router.push(routes.onboarding() as never)}
            />
          </TransitionItem>

          <TransitionItem variant="card" index={9} animate={false}>
            <BusinessPerformanceInsightsCard
              punctuality={business.stats?.percentiles?.punctuality}
              costEffectiveness={business.stats?.percentiles?.['cost-effectiveness']}
              friendliness={business.stats?.percentiles?.friendliness}
              trustworthiness={business.stats?.percentiles?.trustworthiness}
            />
          </TransitionItem>

          <TransitionItem variant="card" index={10} animate={false}>
            <BusinessContactCard
              businessId={business.id}
              businessName={business.name}
              phone={business.phone}
            />
          </TransitionItem>
        </View>

        <TransitionItem variant="card" index={11} animate={false}>
          <BusinessOwnedEventsSection businessId={business.id} businessName={business.name} />
        </TransitionItem>

        <View
          onLayout={(e) => { reviewsSectionYRef.current = e.nativeEvent.layout.y; }}
        >
          <TransitionItem variant="card" index={12} animate={false}>
            <BusinessReviewsSection
              businessId={business.id}
              onPressWriteReview={handleLeaveReview}
              newReviewId={newReviewId}
            />
          </TransitionItem>
        </View>

        <TransitionItem variant="card" index={13} animate={false}>
          <SimilarBusinessesSection businessId={business.id} />
        </TransitionItem>

        {initialTab === 'reviews' ? (
          <TransitionItem variant="card" index={14} animate={false}>
            <View style={styles.deeplinkHint}>
              <Text style={styles.deeplinkHintText}>
                This route now opens the write-review flow to match web behavior.
              </Text>
            </View>
          </TransitionItem>
        ) : null}
        </ScrollView>
      </ScreenTransitionScope>
    </SafeAreaView>
  );
}
