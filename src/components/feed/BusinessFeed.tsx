import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { BusinessListItemDto, PaginatedBusinessFeedResponseDto } from '@sayso/contracts';
import { BusinessCard } from '../BusinessCard';
import { EmptyState } from '../EmptyState';
import { Text } from '../Typography';
import { FeedFooter } from './FeedFooter';
import { LoadMoreButton } from './LoadMoreButton';
import { SkeletonBusinessCard } from './SkeletonBusinessCard';

const DEFAULT_VISIBLE_CHUNK_SIZE = 12;
const BACK_TO_TOP_THRESHOLD = 900;
const FEED_SCROLL_OFFSETS = new Map<string, number>();

const EMPTY_ITEMS: BusinessListItemDto[] = [];

function ItemSeparator() {
  return <View style={styles.separator} />;
}

type Props = {
  feedKey: string;
  queryKey: readonly unknown[];
  subtitle?: string;
  errorTitle: string;
  emptyTitle: string;
  emptyMessage: string;
  requestLimit?: number;
  visibleChunkSize?: number;
  fetchPage: (cursor: string | null) => Promise<PaginatedBusinessFeedResponseDto>;
};

export function BusinessFeed({
  feedKey,
  queryKey,
  subtitle,
  errorTitle,
  emptyTitle,
  emptyMessage,
  requestLimit = DEFAULT_VISIBLE_CHUNK_SIZE,
  visibleChunkSize = DEFAULT_VISIBLE_CHUNK_SIZE,
  fetchPage,
}: Props) {
  const listRef = useRef<FlatList<BusinessListItemDto>>(null);
  const hasRestoredScrollRef = useRef(false);
  const initialOffset = FEED_SCROLL_OFFSETS.get(feedKey) ?? 0;
  const [showBackToTop, setShowBackToTop] = useState(initialOffset > BACK_TO_TOP_THRESHOLD);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(visibleChunkSize);

  const query = useInfiniteQuery({
    queryKey: [...queryKey, requestLimit],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000,
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items ?? page.businesses ?? EMPTY_ITEMS) ?? EMPTY_ITEMS,
    [query.data]
  );
  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const hasNextPage = Boolean(query.hasNextPage);
  const hasBufferedItems = items.length > visibleCount;

  useEffect(() => {
    setVisibleCount(visibleChunkSize);
    setLoadMoreError(null);
  }, [feedKey, visibleChunkSize]);

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

  const keyExtractor = useCallback((item: BusinessListItemDto) => item.id, []);

  const renderItem = useCallback<ListRenderItem<BusinessListItemDto>>(
    ({ item }) => <BusinessCard business={item} />,
    []
  );

  const handleRefresh = useCallback(() => {
    setLoadMoreError(null);
    setVisibleCount(visibleChunkSize);
    void query.refetch();
  }, [query, visibleChunkSize]);

  const handleLoadMore = useCallback(async () => {
    if (hasBufferedItems) {
      setVisibleCount((current) => Math.min(current + visibleChunkSize, items.length));
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

    setVisibleCount((current) => current + visibleChunkSize);
  }, [hasBufferedItems, hasNextPage, items.length, query, visibleChunkSize]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextOffset = event.nativeEvent.contentOffset.y;
      FEED_SCROLL_OFFSETS.set(feedKey, nextOffset);

      const shouldShow = nextOffset > BACK_TO_TOP_THRESHOLD;
      setShowBackToTop((current) => (current === shouldShow ? current : shouldShow));
    },
    [feedKey]
  );

  const handleBackToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const footer = useMemo(() => {
    if (query.isFetchingNextPage) {
      return (
        <View style={styles.footerStack}>
          {Array.from({ length: 5 }, (_, index) => (
            <SkeletonBusinessCard key={`${feedKey}-next-${index}`} />
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

  const listHeader = subtitle ? (
    <View style={styles.header}>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  ) : null;

  const listEmpty = query.isLoading ? (
    <View style={styles.footerStack}>
      {Array.from({ length: 5 }, (_, index) => (
        <SkeletonBusinessCard key={`${feedKey}-initial-${index}`} />
      ))}
    </View>
  ) : query.isError ? (
    <EmptyState icon="wifi-outline" title={errorTitle} message="Pull to refresh and try again." />
  ) : (
    <EmptyState icon="storefront-outline" title={emptyTitle} message={emptyMessage} />
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

      {showBackToTop ? (
        <Pressable style={({ pressed }) => [styles.backToTop, pressed ? styles.backToTopPressed : null]} onPress={handleBackToTop}>
          <Text style={styles.backToTopText}>↑ Top</Text>
        </Pressable>
      ) : null}
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
    paddingBottom: 24,
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
    paddingTop: 12,
    paddingBottom: 12,
    gap: 10,
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
  backToTop: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(45, 55, 72, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  backToTopPressed: {
    opacity: 0.92,
  },
  backToTopText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D3748',
  },
});
