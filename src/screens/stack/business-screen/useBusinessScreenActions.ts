import { useCallback, useMemo, useState } from 'react';
import { Share } from 'react-native';
import { useRouter } from 'expo-router';
import { haptics } from '../../../lib/haptics';
import { type BusinessHeaderRightAction } from '../../../components/business-detail';
import { useSavedBusinesses } from '../../../hooks/useSavedBusinesses';
import { useAuthSession } from '../../../hooks/useSession';
import { useBusinessDetail } from '../../../hooks/useBusinessDetail';
import { apiFetch } from '../../../lib/api';
import { ENV } from '../../../lib/env';
import { routes } from '../../../navigation/routes';

type UseBusinessScreenActionsParams = {
  business: ReturnType<typeof useBusinessDetail>['data'];
  savedQuery: ReturnType<typeof useSavedBusinesses>;
  savedBusinessIds: Set<string>;
  isBusinessSaved: boolean;
};

export function useBusinessScreenActions({
  business,
  savedQuery,
  savedBusinessIds,
  isBusinessSaved,
}: UseBusinessScreenActionsParams) {
  const router = useRouter();
  const { user } = useAuthSession();
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
    setSaveError(null);
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
      setSaveError(error instanceof Error ? error.message : 'Unable to update saved items right now.');
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

  const handleLeaveReview = (businessId: string) => {
    router.push(routes.writeReview('business', businessId) as never);
  };

  return {
    saveBusy,
    saveError,
    setSaveError,
    handleBack,
    handleOpenNotifications,
    handleOpenMessages,
    handleShareBusiness,
    handleToggleSaveBusiness,
    headerRightActions,
    handleLeaveReview,
  };
}
