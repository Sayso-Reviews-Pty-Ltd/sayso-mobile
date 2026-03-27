import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  InteractionManager,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { EmptyState } from '../../components/EmptyState';
import { LoadingCrossfade } from '../../components/LoadingCrossfade';
import { EventSpecialSkeleton } from '../../components/event-detail';
import { NAVBAR_BG_COLOR } from '../../styles/colors';
import { useEventReminder } from '../../hooks/useEventReminder';
import { useEventRatings } from '../../hooks/useEventRatings';
import { useEventReviews } from '../../hooks/useEventReviews';
import { useEventRsvp } from '../../hooks/useEventRsvp';
import { useEventSpecialDetail } from '../../hooks/useEventSpecialDetail';
import { useGlobalScrollToTop } from '../../hooks/useGlobalScrollToTop';
import { useRealtimeQueryInvalidation } from '../../hooks/useRealtimeQueryInvalidation';
import { useRelatedEventSpecials } from '../../hooks/useRelatedEventSpecials';
import { useSavedBusinesses } from '../../hooks/useSavedBusinesses';
import { markFirstContentful, markInteractive } from '../../lib/perf/perfMarkers';
import { routes } from '../../navigation/routes';
import { styles } from './event-special-screen/eventSpecialScreenStyles';
import { EventSpecialScreenContent } from './event-special-screen/EventSpecialScreenContent';
import { useEventSpecialScreenActions } from './event-special-screen/useEventSpecialScreenActions';

type Props = {
  routeType: 'event' | 'special';
};

export default function EventSpecialScreen({ routeType }: Props) {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const savedQuery = useSavedBusinesses();

  const detailQuery = useEventSpecialDetail(id);
  const item = detailQuery.data;

  const linkedBusinessId = useMemo(() => {
    if (!item) return null;
    const snakeCaseId = (item as unknown as Record<string, unknown>).business_id;

    if (typeof item.businessId === 'string' && item.businessId.trim().length > 0) {
      return item.businessId;
    }
    if (typeof snakeCaseId === 'string' && snakeCaseId.trim().length > 0) {
      return snakeCaseId;
    }
    return null;
  }, [item]);

  const savedBusinessIds = useMemo(() => {
    const ids = ((savedQuery.data?.businesses ?? []) as Array<{ id?: string | null }>)
      .map((savedItem: { id?: string | null }) => savedItem?.id)
      .filter(
        (savedId: string | null | undefined): savedId is string =>
          typeof savedId === 'string' && savedId.trim().length > 0
      );
    return new Set(ids);
  }, [savedQuery.data?.businesses]);

  const isLinkedBusinessSaved = Boolean(linkedBusinessId && savedBusinessIds.has(linkedBusinessId));

  useEffect(() => {
    if (item && !detailQuery.isLoading) {
      const markerKey = `event-special:${item.id}`;
      markFirstContentful(markerKey);
      markInteractive(markerKey);
    }
  }, [detailQuery.isLoading, item]);

  const ratings = useEventRatings(
    id,
    item?.rating != null ? Number(item.rating) : 0,
    item?.totalReviews ?? item?.reviews ?? 0
  );
  const reviews = useEventReviews(id);
  const related = useRelatedEventSpecials(id, 4);
  const rsvp = useEventRsvp(id);
  const reminder = useEventReminder(id);

  const realtimeTargets = useMemo(
    () => [
      {
        key: `event-special-detail-${id}`,
        table: 'events_and_specials',
        filter: `id=eq.${id}`,
        queryKeys: [['event-special-detail', id], ['event-related', id]],
        enabled: Boolean(id),
      },
      {
        key: `event-special-reviews-${id}`,
        table: 'reviews',
        filter: `event_id=eq.${id}`,
        queryKeys: [['event-ratings', id], ['event-special-detail', id]],
        enabled: Boolean(id),
      },
    ],
    [id]
  );

  useRealtimeQueryInvalidation(realtimeTargets);

  const scrollRef = useRef<ScrollView | null>(null);
  const scrollTopVisibleRef = useRef(false);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [showDeferredSections, setShowDeferredSections] = useState(false);

  useEffect(() => {
    setShowDeferredSections(false);
    const task = InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        setShowDeferredSections(true);
      });
    });
    return () => { task.cancel(); };
  }, [item?.id]);

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
      setScrollTopVisible(event.nativeEvent.contentOffset.y > 300);
    },
    [setScrollTopVisible]
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(routes.eventsSpecials() as never);
  };

  useEffect(() => {
    if (!item || !id) return;
    if (item.type !== routeType) {
      router.replace((item.type === 'special' ? routes.specialDetail(item.id) : routes.eventDetail(item.id)) as never);
    }
  }, [id, item, routeType, router]);

  const {
    actionError,
    setActionError,
    handlePressGoing,
    handlePressReminder,
    handlePressWriteReview,
    headerRightActions,
  } = useEventSpecialScreenActions({
    id,
    routeType,
    item,
    rsvp,
    reminder,
    savedQuery,
    savedBusinessIds,
    linkedBusinessId,
    isLinkedBusinessSaved,
  });

  if (!detailQuery.isLoading && (!item || item.isExpired)) {
    const missingMessage =
      detailQuery.errorStatus === 404
        ? routeType === 'special'
          ? 'This special may have expired or been removed.'
          : 'This event may no longer be available.'
        : detailQuery.error ?? 'Please try again later.';

    return (
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar style="light" backgroundColor={NAVBAR_BG_COLOR} translucent={false} />
        <View style={[styles.topChrome, { height: insets.top }]} />
        <EmptyState
          icon="calendar"
          title={routeType === 'special' ? 'Special not found' : 'Event not found'}
          message={missingMessage}
          actionLabel="Back to Events & Specials"
          onAction={() => router.replace(routes.eventsSpecials() as never)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" backgroundColor={NAVBAR_BG_COLOR} translucent={false} />
      <View style={[styles.topChrome, { height: insets.top }]} />
      <LoadingCrossfade
        loading={detailQuery.isLoading}
        skeleton={<EventSpecialSkeleton />}
        fillContainer
      >
        {item ? (
          <EventSpecialScreenContent
            scrollRef={scrollRef}
            onScroll={handleScroll}
            item={item}
            routeType={routeType}
            effectiveRating={ratings.rating}
            id={id ?? item.id}
            showDeferredSections={showDeferredSections}
            detailQueryIsError={detailQuery.isError}
            detailQueryError={detailQuery.error}
            onRefetchDetail={() => { void detailQuery.refetch(); }}
            actionError={actionError}
            onDismissActionError={() => setActionError(null)}
            rsvp={rsvp}
            reminder={reminder}
            reviews={reviews}
            related={related}
            headerRightActions={headerRightActions}
            onPressBack={handleBack}
            onPressGoing={() => void handlePressGoing()}
            onPressReminder={(option) => void handlePressReminder(option)}
            onPressWriteReview={handlePressWriteReview}
          />
        ) : null}
      </LoadingCrossfade>
    </SafeAreaView>
  );
}
