import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import type { NotificationDto } from '@sayso/contracts';
import { haptics } from '../../lib/haptics';
import { track } from '../../lib/telemetry';
import {
  useNotificationsList,
  useMarkAllRead,
  useMarkOneRead,
  useDismissNotification,
} from '../../hooks/useNotificationsList';
import { useGlobalScrollToTop } from '../../hooks/useGlobalScrollToTop';
import { useAuthSession } from '../../hooks/useSession';
import { routes } from '../../navigation/routes';
import { NAVBAR_BG_COLOR } from '../../styles/colors';
import { LoadingCrossfade } from '../../components/LoadingCrossfade';
import { NotificationItem } from '../../components/NotificationItem';
import { EmptyState } from '../../components/EmptyState';
import { SkeletonCard } from '../../components/SkeletonCard';
import { Text } from '../../components/Typography';
import { TransitionItem } from '../../components/motion/TransitionItem';
import { ScreenTransitionScope } from '../../components/motion/TransitionScope';
import { APP_PAGE_GUTTER } from '../../styles/layout';

// The server response includes entity_id and entity_type though the DTO
// hasn't been updated to reflect them yet.
type NotificationWithEntity = NotificationDto & {
  entity_id?: string;
  entity_type?: string;
};

type NotificationFilter = 'all' | 'review' | 'badge_earned' | 'dm' | 'business';

const FILTER_CHIPS: Array<{ id: NotificationFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'review', label: 'Reviews' },
  { id: 'badge_earned', label: 'Badges' },
  { id: 'dm', label: 'Messages' },
  { id: 'business', label: 'Businesses' },
];

function matchesFilter(type: string, filter: NotificationFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'review') return ['review', 'review_helpful', 'comment_reply'].includes(type);
  if (filter === 'badge_earned') return ['badge_earned', 'milestone_achievement'].includes(type);
  if (filter === 'dm') return ['message', 'dm'].includes(type);
  if (filter === 'business') return ['business', 'claim_approved', 'business_approved'].includes(type);
  return false;
}

function resolveRoute(notification: NotificationWithEntity): string | null {
  // Use the server-provided deep link when available — it already encodes the
  // correct path and avoids needing entity_id/entity_type client-side.
  if (notification.link) return notification.link;

  const eid = notification.entity_id;

  switch (notification.type) {
    case 'review':
    case 'review_helpful':
    case 'comment_reply':
      if (!eid) return null;
      if (notification.entity_type === 'event') return routes.eventDetail(eid);
      if (notification.entity_type === 'special') return routes.specialDetail(eid);
      return routes.businessDetail(eid);
    case 'business':
    case 'claim_approved':
    case 'business_approved':
      return eid ? routes.businessDetail(eid) : null;
    case 'badge_earned':
      return routes.badges();
    case 'achievement':
    case 'milestone_achievement':
      return routes.achievements();
    case 'dm':
    case 'message':
      return eid ? routes.dmThread(eid) : null;
    case 'follow':
    case 'reviewer':
      return eid ? routes.publicProfile(eid) : null;
    default:
      return null;
  }
}

export default function NotificationsScreen() {
  const { user } = useAuthSession();
  const router = useRouter();
  const { data, isLoading, isError, refetch, isRefetching } = useNotificationsList();
  const markAllRead = useMarkAllRead();
  const markOneRead = useMarkOneRead();
  const dismissNotification = useDismissNotification();
  const listRef = useRef<FlatList<NotificationDto> | null>(null);
  const scrollTopVisibleRef = useRef(false);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');

  const setScrollTopVisible = useCallback((visible: boolean) => {
    if (scrollTopVisibleRef.current === visible) return;
    scrollTopVisibleRef.current = visible;
    setShowScrollTopButton(visible);
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setScrollTopVisible(event.nativeEvent.contentOffset.y > 220);
    },
    [setScrollTopVisible]
  );

  const handleScrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const allNotifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;
  const filteredNotifications = allNotifications.filter((n) =>
    matchesFilter(n.type, activeFilter)
  );
  const showNotificationList = allNotifications.length > 0 && !isLoading;

  useGlobalScrollToTop({
    visible: showScrollTopButton,
    enabled: Boolean(user) && showNotificationList,
    onScrollToTop: handleScrollToTop,
  });

  useEffect(() => {
    if (!user || !showNotificationList) {
      setScrollTopVisible(false);
    }
  }, [setScrollTopVisible, showNotificationList, user]);

  const handleNotificationPress = useCallback(
    (notification: NotificationWithEntity) => {
      haptics.navigation();
      // Mark as read only if not already read.
      if (!notification.read_at) {
        markOneRead.mutate(notification.id);
      }
      const route = resolveRoute(notification);
      if (route) {
        router.push(route as never);
      }
    },
    [markOneRead, router]
  );

  const handleDismiss = useCallback(
    (id: string) => async () => {
      await dismissNotification.mutateAsync(id);
    },
    [dismissNotification]
  );

  const filterBar = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRow}
      style={styles.filterScroll}
    >
      {FILTER_CHIPS.map((chip) => (
        <Pressable
          key={chip.id}
          style={[styles.chip, activeFilter === chip.id && styles.chipActive]}
          onPress={() => { haptics.navigation(); setActiveFilter(chip.id); }}
          accessibilityRole="button"
          accessibilityState={{ selected: activeFilter === chip.id }}
        >
          <Text style={[styles.chipText, activeFilter === chip.id && styles.chipTextActive]}>
            {chip.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Notifications' }} />
        <ScreenTransitionScope>
          <TransitionItem role="support" index={0}>
          <EmptyState
            icon="notifications-outline"
            title="Sign in to see notifications"
            actionLabel="Sign in"
            onAction={() => router.push(routes.onboarding() as never)}
          />
          </TransitionItem>
        </ScreenTransitionScope>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} accessibilityLabel="Notifications">
      <Stack.Screen options={{ title: 'Notifications' }} />
      <ScreenTransitionScope>
        <TransitionItem role="hero" index={0}>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 ? (
            <TouchableOpacity onPress={() => { haptics.confirm(); markAllRead.mutate(undefined, { onError: () => track('ux.notification_action_failed', { action: 'mark_all_read' }) }); }} disabled={markAllRead.isPending}>
              <Text style={styles.markRead}>Mark all read</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </TransitionItem>

      <LoadingCrossfade
        loading={isLoading}
        skeleton={
          <View style={{ paddingHorizontal: APP_PAGE_GUTTER, paddingVertical: 16 }}>
            {[1, 2, 3].map((item, index) => (
              <TransitionItem key={item} role="listItem" index={index + 1}>
                <SkeletonCard />
              </TransitionItem>
            ))}
          </View>
        }
      >
        {isError ? (
          <TransitionItem role="support" index={1}>
            <EmptyState
              icon="cloud-offline-outline"
              title="Couldn't load notifications"
              message="Pull down to try again."
              actionLabel="Retry"
              onAction={() => { void refetch(); }}
            />
          </TransitionItem>
        ) : allNotifications.length === 0 ? (
          <TransitionItem role="support" index={1}>
            <EmptyState
              icon="notifications-outline"
              title="All caught up"
              message="You'll see reviews, badges, and activity here."
            />
          </TransitionItem>
        ) : (
          <FlatList
            ref={listRef}
            data={filteredNotifications}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <TransitionItem role="listItem" index={index + 1} animate={index < 10}>
                <NotificationItem
                  notification={item}
                  onPress={() => handleNotificationPress(item as NotificationWithEntity)}
                  onDismiss={handleDismiss(item.id)}
                />
              </TransitionItem>
            )}
            ListHeaderComponent={filterBar}
            ListEmptyComponent={
              <View style={styles.emptyFilter}>
                <Text style={styles.emptyFilterText}>No {FILTER_CHIPS.find((c) => c.id === activeFilter)?.label.toLowerCase()} notifications.</Text>
              </View>
            }
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          />
        )}
      </LoadingCrossfade>
      </ScreenTransitionScope>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E0E5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: APP_PAGE_GUTTER,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  markRead: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  filterScroll: {
    paddingVertical: 12,
  },
  filterRow: {
    gap: 8,
    paddingHorizontal: APP_PAGE_GUTTER,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.80)',
    borderWidth: 1,
    borderColor: 'rgba(45,45,45,0.20)',
  },
  chipActive: {
    backgroundColor: NAVBAR_BG_COLOR,
    borderColor: NAVBAR_BG_COLOR,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D2D2D',
  },
  chipTextActive: {
    color: '#fff',
  },
  emptyFilter: {
    paddingHorizontal: APP_PAGE_GUTTER,
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyFilterText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
