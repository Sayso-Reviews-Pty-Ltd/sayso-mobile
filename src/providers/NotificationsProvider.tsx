import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import type { NotificationsResponseDto } from '@sayso/contracts';
import { apiFetch } from '../lib/api';
import { ENV } from '../lib/env';
import { supabase } from '../lib/supabase';
import { routes } from '../navigation/routes';
import { useAuth } from './AuthProvider';

interface NotificationsContextValue {
  unreadCount: number;
  refresh: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

type ExpoNotificationsModule = typeof import('expo-notifications');

function loadNotificationsModule(): ExpoNotificationsModule | null {
  if (Constants.appOwnership === 'expo') {
    return null;
  }

  const runtimeRequire = (globalThis as { require?: (id: string) => unknown }).require;
  if (!runtimeRequire) return null;

  try {
    return runtimeRequire('expo-notifications') as ExpoNotificationsModule;
  } catch {
    return null;
  }
}

async function registerPushToken(notifications: ExpoNotificationsModule) {
  if (!Device.isDevice) return;

  const { status: existingStatus } = await notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  const token = await notifications.getExpoPushTokenAsync({ projectId: ENV.easProjectId });

  await apiFetch('/api/user/push-tokens', {
    method: 'POST',
    body: JSON.stringify({
      expoPushToken: token.data,
      platform: Device.osName?.toLowerCase() === 'ios' ? 'ios' : 'android',
    }),
  });
}

/** Build a deep-link route from notification payload. Falls back to /notifications. */
function buildNotificationRoute(data: Record<string, unknown>): string {
  const type = data.type as string | undefined;
  const entityId = data.entity_id as string | undefined;
  const entityType = data.entity_type as string | undefined;

  switch (type) {
    case 'review': {
      if (!entityId) return routes.notifications();
      if (entityType === 'event') return routes.eventDetail(entityId);
      if (entityType === 'special') return routes.specialDetail(entityId);
      return routes.businessDetail(entityId);
    }
    case 'badge_earned':
      return routes.badges();
    case 'dm':
      return entityId ? routes.dmThread(entityId) : routes.notifications();
    case 'milestone_achievement':
      return routes.achievements();
    case 'business':
      return entityId ? routes.businessDetail(entityId) : routes.notifications();
    default:
      return routes.notifications();
  }
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  // Keep a ref to the latest router so listeners never close over a stale instance
  const routerRef = useRef(router);
  useEffect(() => { routerRef.current = router; }, [router]);

  // isReadyRef: true after first paint so cold-start taps queue rather than drop
  const isReadyRef = useRef(false);
  const pendingRouteRef = useRef<string | null>(null);

  // Mark ready on mount and flush any notification tap that arrived before mount
  useEffect(() => {
    isReadyRef.current = true;
    if (pendingRouteRef.current) {
      const path = pendingRouteRef.current;
      pendingRouteRef.current = null;
      routerRef.current.push(path as never);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stable navigate helper — queues navigation if called before mount
  const navigateRef = useRef((path: string) => {
    if (isReadyRef.current) {
      routerRef.current.push(path as never);
    } else {
      pendingRouteRef.current = path;
    }
  });

  const refresh = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    const data = await apiFetch<NotificationsResponseDto>('/api/notifications/user');
    const unread = data.notifications.filter((item: { read?: boolean }) => !item.read).length;
    setUnreadCount(unread);
  }, [user]);

  // Keep a ref so listener closures always call the latest refresh
  const refreshRef = useRef(refresh);
  useEffect(() => { refreshRef.current = refresh; }, [refresh]);

  // ─── A + B + C: Notification listeners & DM category ──────────────────────
  useEffect(() => {
    const notifications = loadNotificationsModule();
    if (!notifications) return;

    // C: Register "Reply" text-input action for DM notifications
    void notifications.setNotificationCategoryAsync('dm', [
      {
        identifier: 'REPLY',
        buttonTitle: 'Reply',
        textInput: {
          submitButtonTitle: 'Send',
          placeholder: 'Message...',
        },
        options: {
          opensAppToForeground: false,
        },
      },
    ]);

    // A: Foreground — refresh unread count immediately when a notification arrives
    const receivedSub = notifications.addNotificationReceivedListener(() => {
      refreshRef.current().catch(() => undefined);
    });

    // B: Tap — deep link from system tray (background or closed)
    const responseSub = notifications.addNotificationResponseReceivedListener((response) => {
      const data = (response.notification.request.content.data ?? {}) as Record<string, unknown>;

      // C: Handle inline reply without opening the app
      if (response.actionIdentifier === 'REPLY') {
        const threadId = data.entity_id as string | undefined;
        const text = response.userText?.trim();
        if (threadId && text) {
          apiFetch(`/api/conversations/${threadId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ body: text }),
          }).catch(() => undefined);
        }
        return;
      }

      navigateRef.current(buildNotificationRoute(data));
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, []); // listeners are mounted once; freshness is handled via refs

  // ─── Token registration + realtime + initial refresh ──────────────────────
  useEffect(() => {
    if (!user?.id) return;

    const notifications = loadNotificationsModule();
    if (notifications) {
      registerPushToken(notifications).catch((error) => {
        console.warn('[NotificationsProvider] Push token registration failed:', error);
      });
    }

    refresh().catch((error) => {
      console.warn('[NotificationsProvider] Initial refresh failed:', error);
    });

    const channel = supabase
      .channel(`mobile-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          refresh().catch(() => undefined);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refresh]);

  const value = useMemo<NotificationsContextValue>(
    () => ({ unreadCount, refresh }),
    [unreadCount, refresh]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotificationsContext() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotificationsContext must be used within NotificationsProvider');
  return ctx;
}
