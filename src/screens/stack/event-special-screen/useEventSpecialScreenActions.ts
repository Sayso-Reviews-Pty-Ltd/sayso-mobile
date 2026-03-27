import { useCallback, useMemo, useState } from 'react';
import { Share } from 'react-native';
import { useRouter } from 'expo-router';
import { type EventSpecialHeaderRightAction } from '../../../components/event-detail';
import { useEventReminder } from '../../../hooks/useEventReminder';
import { useEventRsvp } from '../../../hooks/useEventRsvp';
import { useEventSpecialDetail } from '../../../hooks/useEventSpecialDetail';
import { useSavedBusinesses } from '../../../hooks/useSavedBusinesses';
import { useAuthSession } from '../../../hooks/useSession';
import { apiFetch } from '../../../lib/api';
import { ENV } from '../../../lib/env';
import { routes } from '../../../navigation/routes';

function isUnauthorizedError(message: string | null) {
  return Boolean(message && /HTTP\s+401/.test(message));
}

type UseEventSpecialScreenActionsParams = {
  id: string | undefined;
  routeType: 'event' | 'special';
  item: ReturnType<typeof useEventSpecialDetail>['data'];
  rsvp: ReturnType<typeof useEventRsvp>;
  reminder: ReturnType<typeof useEventReminder>;
  savedQuery: ReturnType<typeof useSavedBusinesses>;
  savedBusinessIds: Set<string>;
  linkedBusinessId: string | null;
  isLinkedBusinessSaved: boolean;
};

export function useEventSpecialScreenActions({
  id,
  routeType,
  item,
  rsvp,
  reminder,
  savedQuery,
  savedBusinessIds,
  linkedBusinessId,
  isLinkedBusinessSaved,
}: UseEventSpecialScreenActionsParams) {
  const router = useRouter();
  const { user } = useAuthSession();
  const [saveBusy, setSaveBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handlePressGoing = async () => {
    if (!user) {
      router.push(routes.onboarding() as never);
      return;
    }

    setActionError(null);
    try {
      await rsvp.toggleRsvp();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update RSVP right now.';
      if (isUnauthorizedError(message)) {
        router.push(routes.onboarding() as never);
        return;
      }
      setActionError(message);
    }
  };

  const handlePressReminder = async (option: '1_day' | '2_hours') => {
    if (!user) {
      router.push(routes.onboarding() as never);
      return;
    }

    if (!item?.startDateISO) {
      setActionError('This listing does not have a valid start date yet.');
      return;
    }

    setActionError(null);
    try {
      const isActive = reminder.hasReminder(option);
      await reminder.toggleReminder({
        option,
        startDateISO: item.startDateISO,
        eventTitle: item.title,
        hasReminder: isActive,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update reminder right now.';
      if (isUnauthorizedError(message)) {
        router.push(routes.onboarding() as never);
        return;
      }
      setActionError(message);
    }
  };

  const handlePressWriteReview = () => {
    if (!id) return;
    router.push(routes.writeReview(routeType, id) as never);
  };

  const handleShareEventSpecial = useCallback(async () => {
    if (!item) return;
    const origin = ENV.apiBaseUrl || 'https://www.sayso.co.za';
    const detailPath = routeType === 'special' ? routes.specialDetail(item.id) : routes.eventDetail(item.id);

    try {
      await Share.share({
        title: item.title,
        message: `Check out ${item.title} on Sayso\n${origin}${detailPath}`,
      });
    } catch {
      // Non-blocking.
    }
  }, [item, routeType]);

  const handleToggleSaveFromEventSpecial = useCallback(async () => {
    if (!linkedBusinessId) {
      setActionError('Saving is unavailable for this listing.');
      return;
    }
    if (!user) {
      router.push(routes.onboarding() as never);
      return;
    }
    if (saveBusy) return;

    setSaveBusy(true);
    setActionError(null);
    try {
      if (savedBusinessIds.has(linkedBusinessId)) {
        await apiFetch<{ success?: boolean; message?: string }>(
          `/api/user/saved?business_id=${linkedBusinessId}`,
          { method: 'DELETE' }
        );
      } else {
        await apiFetch<{ success?: boolean; message?: string }>('/api/user/saved', {
          method: 'POST',
          body: JSON.stringify({ business_id: linkedBusinessId }),
        });
      }
      await savedQuery.refetch();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to update saved items right now.');
    } finally {
      setSaveBusy(false);
    }
  }, [linkedBusinessId, router, saveBusy, savedBusinessIds, savedQuery, user]);

  const headerRightActions = useMemo<EventSpecialHeaderRightAction[]>(
    () => [
      {
        key: 'share',
        icon: 'share-social-outline',
        onPress: () => {
          void handleShareEventSpecial();
        },
        accessibilityLabel: 'Share listing',
      },
      {
        key: 'save',
        icon: isLinkedBusinessSaved ? 'bookmark' : 'bookmark-outline',
        onPress: () => {
          void handleToggleSaveFromEventSpecial();
        },
        accessibilityLabel: linkedBusinessId
          ? isLinkedBusinessSaved
            ? 'Unsave business'
            : 'Save business'
          : 'Save unavailable',
        disabled: saveBusy,
      },
    ],
    [handleShareEventSpecial, handleToggleSaveFromEventSpecial, isLinkedBusinessSaved, linkedBusinessId, saveBusy]
  );

  return {
    saveBusy,
    actionError,
    setActionError,
    handlePressGoing,
    handlePressReminder,
    handlePressWriteReview,
    handleShareEventSpecial,
    handleToggleSaveFromEventSpecial,
    headerRightActions,
  };
}
