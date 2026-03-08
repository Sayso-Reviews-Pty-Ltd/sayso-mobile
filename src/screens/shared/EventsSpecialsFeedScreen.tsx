import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { EventSpecialListItemDto, EventsAndSpecialsResponseDto } from '@sayso/contracts';
import { apiFetch } from '../../lib/api';
import { EventCard } from '../../components/EventCard';
import { EventCardSkeleton } from '../../components/EventCardSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { Text } from '../../components/Typography';
import { FeedFooter } from '../../components/feed/FeedFooter';
import { LoadMoreButton } from '../../components/feed/LoadMoreButton';
import { useGlobalScrollToTop } from '../../hooks/useGlobalScrollToTop';

const REQUEST_LIMIT = 20;
const VISIBLE_CHUNK_SIZE = 12;
const BACK_TO_TOP_THRESHOLD = 900;
const EVENT_FEED_SCROLL_OFFSETS = new Map<string, number>();
const EMPTY_ITEMS: EventSpecialListItemDto[] = [];

function ItemSeparator() {
  return <View style={styles.separator} />;
}

type Props = {
  subtitle: string;
  onScrollY?: (y: number) => void;
};

function fetchEventsPage(cursor: string | null) {
  const params = new URLSearchParams();
  params.set('limit', String(REQUEST_LIMIT));
  if (cursor) {
    params.set('cursor', cursor);
  }

  return apiFetch<EventsAndSpecialsResponseDto>(`/api/events-and-specials?${params.toString()}`);
}

export function EventsSpecialsFeedScreen({ subtitle, onScrollY }: Props) {
  const listRef = useRef<FlatList<EventSpecialListItemDto>>(null);
  const hasRestoredScrollRef = useRef(false);
  const initialOffset = EVENT_FEED_SCROLL_OFFSETS.get('events-specials') ?? 0;
  const [showScrollTopButton, setShowScrollTopButton] = useState(initialOffset > BACK_TO_TOP_THRESHOLD);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(VISIBLE_CHUNK_SIZE);

  const handleScrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  useGlobalScrollToTop({
    visible: showScrollTopButton,
    enabled: true,
    onScrollToTop: handleScrollToTop,
  });

  const fabAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(fabAnim, {
      toValue: showScrollTopButton ? 1 : 0,
      damping: 18,
      stiffness: 260,
      useNativeDriver: true,
    }).start();
  }, [showScrollTopButton, fabAnim]);

  const query = useInfiniteQuery({
    queryKey: ['events-specials-feed', REQUEST_LIMIT],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => fetchEventsPage(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000,
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items ?? EMPTY_ITEMS) ?? EMPTY_ITEMS,
    [query.data]
  );
  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const hasNextPage = Boolean(query.hasNextPage);
  const hasBufferedItems = items.length > visibleCount;

  useEffect(() => {
    setVisibleCount(VISIBLE_CHUNK_SIZE);
    setLoadMoreError(null);
  }, []);

  useEffect(() => {
    if (hasRestoredScrollRef.current || initialOffset <= 0 || visibleItems.length === 0) {
      return;
    }

    hasRestoredScrollRef.current = true;
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: initialOffset, animated: false });
    });
  }, [initialOffset, visibleItems.length]);

  useEffect(() => {
    if (!hasNextPage && !hasBufferedItems) {
      setLoadMoreError(null);
    }
  }, [hasBufferedItems, hasNextPage]);

  const keyExtractor = useCallback((item: EventSpecialListItemDto) => `${item.type}:${item.id}`, []);

  const renderItem = useCallback<ListRenderItem<EventSpecialListItemDto>>(
    ({ item }) => <EventCard item={item} />,
    []
  );

  const handleRefresh = useCallback(() => {
    setLoadMoreError(null);
    setVisibleCount(VISIBLE_CHUNK_SIZE);
    void query.refetch();
  }, [query]);

  const handleLoadMore = useCallback(async () => {
    if (hasBufferedItems) {
      setVisibleCount((current) => Math.min(current + VISIBLE_CHUNK_SIZE, items.length));
      return;
    }

    if (query.isFetchingNextPage || !hasNextPage) {
      return;
    }

    setLoadMoreError(null);
    const result = await query.fetchNextPage();
    if (result.isError) {
      setLoadMoreError("Couldn't load more right now. Tap Load More to try again.");
      return;
    }

    setVisibleCount((current) => current + VISIBLE_CHUNK_SIZE);
  }, [hasBufferedItems, hasNextPage, items.length, query]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextOffset = event.nativeEvent.contentOffset.y;
    EVENT_FEED_SCROLL_OFFSETS.set('events-specials', nextOffset);
    const shouldShow = nextOffset > BACK_TO_TOP_THRESHOLD;
    setShowScrollTopButton((current) => (current === shouldShow ? current : shouldShow));
    onScrollY?.(nextOffset);
  }, [onScrollY]);

  const footer = useMemo(() => {
    if (query.isFetchingNextPage) {
      return (
        <View style={styles.footerStack}>
          {Array.from({ length: 5 }, (_, index) => (
            <EventCardSkeleton key={`events-loading-${index}`} />
          ))}
        </View>
      );
    }

    if (hasBufferedItems || hasNextPage) {
      return (
        <View style={styles.loadMoreWrap}>
          {loadMoreError ? <Text style={styles.loadMoreError}>{loadMoreError}</Text> : null}
          <LoadMoreButton onPress={() => void handleLoadMore()} />
        </View>
      );
    }

    if (!hasNextPage && !hasBufferedItems && visibleItems.length > 0) {
      return <FeedFooter />;
    }

    return <View style={styles.footerSpacer} />;
  }, [handleLoadMore, hasBufferedItems, hasNextPage, loadMoreError, query.isFetchingNextPage, visibleItems.length]);

  const listHeader = (
    <View style={styles.header}>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );

  const listEmpty = query.isLoading ? (
    <View style={styles.footerStack}>
      {Array.from({ length: 5 }, (_, index) => (
        <EventCardSkeleton key={`events-initial-${index}`} />
      ))}
    </View>
  ) : query.isError ? (
    <EmptyState icon="wifi-outline" title="Couldn't load events & specials" message="Pull to refresh and try again." />
  ) : (
    <EmptyState
      icon="calendar-outline"
      title="No events & specials yet"
      message="Check back shortly for fresh listings."
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={query.isLoading ? EMPTY_ITEMS : visibleItems}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={footer}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching && !query.isFetchingNextPage}
            onRefresh={handleRefresh}
          />
        }
        initialNumToRender={8}
        windowSize={5}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      />

      {/* Scroll-to-top FAB */}
      <Animated.View
        style={[
          styles.scrollTopFab,
          {
            opacity: fabAnim,
            transform: [{ scale: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
          },
        ]}
        pointerEvents={showScrollTopButton ? 'box-none' : 'none'}
      >
        <Pressable
          style={({ pressed }) => [styles.scrollTopBtn, pressed && styles.scrollTopBtnPressed]}
          onPress={handleScrollToTop}
          accessibilityRole="button"
          accessibilityLabel="Scroll to top"
        >
          <Ionicons name="chevron-up" size={20} color="#2D3748" />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 14,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    color: '#4B5563',
  },
  separator: {
    height: 12,
  },
  footerStack: {
    gap: 12,
    paddingTop: 12,
  },
  loadMoreWrap: {
    paddingTop: 4,
    paddingBottom: 8,
    gap: 6,
  },
  loadMoreError: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  footerSpacer: {
    height: 12,
  },
  scrollTopFab: {
    position: 'absolute',
    right: 16,
    bottom: 32,
    zIndex: 100,
  },
  scrollTopBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: 'rgba(229,224,229,0.90)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  scrollTopBtnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.95 }],
  },
});

