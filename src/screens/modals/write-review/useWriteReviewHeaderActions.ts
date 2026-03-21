import { useCallback, useMemo, useState } from 'react';
import { Alert, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { type BusinessHeaderRightAction } from '../../../components/business-detail';
import { apiFetch } from '../../../lib/api';
import { ENV } from '../../../lib/env';
import { routes } from '../../../navigation/routes';
import type { WriteReviewParams } from '../../../navigation/types';

type SavedQuery = {
  data?: { businesses?: Array<{ id?: string | null }> };
  refetch: () => Promise<unknown>;
};

type Params = {
  isBusinessReview: boolean;
  businessDetail: Record<string, unknown> | null | undefined;
  eventSpecial: Record<string, unknown> | null | undefined;
  id: string;
  type: WriteReviewParams['type'];
  displayTitle: string;
  user: { id: string } | null | undefined;
  savedQuery: SavedQuery;
};

export function useWriteReviewHeaderActions({
  isBusinessReview, businessDetail, eventSpecial, id, type, displayTitle, user, savedQuery,
}: Params) {
  const router = useRouter();
  const [saveBusy, setSaveBusy] = useState(false);

  const linkedBusinessId = useMemo(() => {
    if (isBusinessReview) {
      return typeof businessDetail?.id === 'string' && businessDetail.id.trim() ? businessDetail.id : (id.trim() ? id : null);
    }
    const es = eventSpecial ?? null;
    const camelId = es && typeof es.businessId === 'string' ? es.businessId.trim() : '';
    if (camelId) return camelId;
    const snakeId = es && typeof es.business_id === 'string' ? es.business_id.trim() : '';
    return snakeId || null;
  }, [businessDetail?.id, eventSpecial, id, isBusinessReview]);

  const savedBusinessIds = useMemo(() => {
    const ids = ((savedQuery.data?.businesses ?? []) as Array<{ id?: string | null }>)
      .map((item) => item?.id)
      .filter((savedId): savedId is string => typeof savedId === 'string' && savedId.trim().length > 0);
    return new Set(ids);
  }, [savedQuery.data?.businesses]);

  const isLinkedBusinessSaved = Boolean(linkedBusinessId && savedBusinessIds.has(linkedBusinessId));

  const handleHeaderShare = useCallback(async () => {
    const origin = ENV.apiBaseUrl || 'https://www.sayso.co.za';
    const shareTitle = displayTitle || 'Sayso';
    const targetPath = isBusinessReview
      ? routes.businessDetail(String(businessDetail?.id ?? id) || id)
      : type === 'special' ? routes.specialDetail(id) : routes.eventDetail(id);
    try {
      await Share.share({ title: shareTitle, message: `Check out ${shareTitle} on Sayso\n${origin}${targetPath}` });
    } catch { /* non-blocking */ }
  }, [businessDetail?.id, displayTitle, id, isBusinessReview, type]);

  const handleHeaderSave = useCallback(async () => {
    if (!linkedBusinessId) { Alert.alert('Save unavailable', 'Saving is unavailable for this listing.'); return; }
    if (!user) { router.push(routes.onboarding() as never); return; }
    if (saveBusy) return;
    setSaveBusy(true);
    try {
      if (savedBusinessIds.has(linkedBusinessId)) {
        await apiFetch<{ success?: boolean }>(`/api/user/saved?business_id=${linkedBusinessId}`, { method: 'DELETE' });
      } else {
        await apiFetch<{ success?: boolean }>('/api/user/saved', { method: 'POST', body: JSON.stringify({ business_id: linkedBusinessId }) });
      }
      await savedQuery.refetch();
    } catch (error) {
      Alert.alert('Save unavailable', error instanceof Error ? error.message : 'Unable to update saved items right now.');
    } finally {
      setSaveBusy(false);
    }
  }, [linkedBusinessId, router, saveBusy, savedBusinessIds, savedQuery, user]);

  const headerRightActions = useMemo<BusinessHeaderRightAction[]>(
    () => [
      { key: 'share', icon: 'share-social-outline', onPress: () => { void handleHeaderShare(); }, accessibilityLabel: 'Share listing' },
      {
        key: 'save',
        icon: isLinkedBusinessSaved ? 'bookmark' : 'bookmark-outline',
        onPress: () => { void handleHeaderSave(); },
        accessibilityLabel: linkedBusinessId ? (isLinkedBusinessSaved ? 'Unsave business' : 'Save business') : 'Save unavailable',
        disabled: saveBusy,
      },
    ],
    [handleHeaderSave, handleHeaderShare, isLinkedBusinessSaved, linkedBusinessId, saveBusy]
  );

  return { headerRightActions, linkedBusinessId, isLinkedBusinessSaved, saveBusy };
}
