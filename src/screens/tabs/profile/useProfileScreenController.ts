import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, type NativeScrollEvent, type NativeSyntheticEvent, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  useDeleteUserReview,
  useUserReviews,
} from '../../../hooks/useUserReviews';
import { useDeleteAccount } from '../../../hooks/useDeleteAccount';
import { useGlobalScrollToTop } from '../../../hooks/useGlobalScrollToTop';
import { useProfile, useUpdateProfile } from '../../../hooks/useProfile';
import { useSavedBusinesses } from '../../../hooks/useSavedBusinesses';
import { useAuthSession } from '../../../hooks/useSession';
import { useUserBadges } from '../../../hooks/useUserBadges';
import { useUserStats } from '../../../hooks/useUserStats';
import { supabase } from '../../../lib/supabase';
import { routes } from '../../../navigation/routes';
import { useSecurity } from '../../../providers/SecurityProvider';
import { AVATAR_MAX_SIZE } from './constants';
import {
  extractStoragePath,
  formatMemberSince,
  getAvatarExtension,
  normalizeProfileLocation,
} from './helpers';
import type { EditProfileSavePayload } from '../../../components/profile/EditProfileModal';
import { useLocationPermissionStatus } from './useLocationPermissionStatus';

export function useProfileScreenController() {
  const router = useRouter();
  const { user, signOut } = useAuthSession();
  const { guardSensitiveAction } = useSecurity();

  const profileQuery = useProfile();
  const statsQuery = useUserStats();
  const reviewsQuery = useUserReviews();
  const badgesQuery = useUserBadges();
  const savedQuery = useSavedBusinesses();

  const updateProfile = useUpdateProfile();
  const deleteReview = useDeleteUserReview();
  const deleteAccount = useDeleteAccount();

  const profile = profileQuery.data?.data;
  const userStats = statsQuery.data?.data;
  const userReviews = reviewsQuery.data?.data?.data ?? [];
  const earnedBadges = badgesQuery.data ?? [];
  const savedBusinesses = savedQuery.data?.businesses ?? [];

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [showAllContributions, setShowAllContributions] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [deleteReviewError, setDeleteReviewError] = useState<string | null>(null);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);

  const {
    locationStatus,
    requestLocationPermission,
    syncLocationPermission,
  } = useLocationPermissionStatus();

  const scrollRef = useRef<ScrollView | null>(null);
  const scrollTopVisibleRef = useRef(false);

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
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  useGlobalScrollToTop({
    visible: showScrollTopButton,
    enabled: Boolean(user),
    onScrollToTop: handleScrollToTop,
  });

  useEffect(() => {
    if (!user) setScrollTopVisible(false);
  }, [setScrollTopVisible, user]);

  const displayLabel =
    profile?.display_name?.trim() || profile?.username || user?.email?.split('@')[0] || 'Your Profile';

  const profileLocation = normalizeProfileLocation(profile?.location);
  const memberSinceLabel = formatMemberSince(
    userStats?.accountCreationDate ?? profile?.created_at ?? user?.created_at ?? null
  );
  const reviewsCount =
    userReviews.length > 0
      ? userReviews.length
      : profile?.reviews_count ?? profile?.review_count ?? userStats?.totalReviewsWritten ?? 0;
  const badgesCount = earnedBadges.length;
  const interestsCount = profile?.interests_count ?? 0;
  const helpfulVotesCount = userStats?.helpfulVotesReceived ?? 0;
  const savedBusinessesCount =
    savedBusinesses.length > 0 ? savedBusinesses.length : userStats?.totalBusinessesSaved ?? 0;

  const isRefreshing =
    profileQuery.isRefetching ||
    statsQuery.isRefetching ||
    reviewsQuery.isRefetching ||
    badgesQuery.isRefetching ||
    savedQuery.isRefetching;

  const handleRefresh = useCallback(() => {
    profileQuery.refetch();
    statsQuery.refetch();
    reviewsQuery.refetch();
    badgesQuery.refetch();
    savedQuery.refetch();
    syncLocationPermission();
  }, [badgesQuery, profileQuery, reviewsQuery, savedQuery, statsQuery, syncLocationPermission]);

  const removeExistingAvatar = useCallback(async (avatarUrl?: string | null) => {
    const existingPath = extractStoragePath(avatarUrl);
    if (!existingPath) return;
    await supabase.storage.from('avatars').remove([existingPath]);
  }, []);

  const handleSaveProfile = useCallback(async (payload: EditProfileSavePayload) => {
    if (!user) return;
    setProfileSaveError(null);
    setProfileSaving(true);
    try {
      const currentAvatarUrl = profile?.avatar_url ?? null;
      const currentAvatarPath = extractStoragePath(currentAvatarUrl);
      let nextAvatarUrl: string | null = currentAvatarUrl;
      let shouldRemoveCurrentAvatar = payload.removeAvatar;
      if (payload.removeAvatar) nextAvatarUrl = null;

      if (payload.avatarAsset) {
        const mimeType = payload.avatarAsset.mimeType || 'image/jpeg';
        if (!mimeType.startsWith('image/')) throw new Error('Please select an image file for your avatar.');
        if ((payload.avatarAsset.fileSize ?? 0) > AVATAR_MAX_SIZE) throw new Error('Image file is too large. Maximum size is 5MB.');
        const extension = getAvatarExtension(payload.avatarAsset.fileName, mimeType);
        const path = `${user.id}/avatar-${Date.now()}.${extension}`;
        const response = await fetch(payload.avatarAsset.uri);
        const blob = await response.blob();
        if (blob.size > AVATAR_MAX_SIZE) throw new Error('Image file is too large. Maximum size is 5MB.');
        const { error: uploadError } = await supabase.storage.from('avatars').upload(path, blob, {
          cacheControl: '3600',
          upsert: true,
          contentType: mimeType,
        });
        if (uploadError) throw new Error(uploadError.message || 'Failed to upload avatar image.');
        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path);
        if (!publicUrlData?.publicUrl) throw new Error('Failed to retrieve uploaded avatar URL.');
        nextAvatarUrl = publicUrlData.publicUrl;
        shouldRemoveCurrentAvatar = Boolean(currentAvatarPath && currentAvatarPath !== path);
      }

      await updateProfile.mutateAsync({
        username: payload.username.trim(),
        display_name: payload.displayName.trim() || null,
        avatar_url: nextAvatarUrl,
      });
      if (shouldRemoveCurrentAvatar && currentAvatarUrl) removeExistingAvatar(currentAvatarUrl).catch(() => {});
      setIsEditOpen(false);
    } catch (error) {
      setProfileSaveError(error instanceof Error ? error.message : 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  }, [profile?.avatar_url, removeExistingAvatar, updateProfile, user]);

  const handleEditReview = useCallback((reviewId: string, businessId?: string | null) => {
    if (!businessId) {
      Alert.alert('Unable to edit', 'Business details for this review are unavailable.');
      return;
    }
    router.push(routes.writeReview('business', businessId, reviewId) as never);
  }, [router]);

  const handleDeleteReviewConfirm = useCallback(async () => {
    if (!reviewToDelete) return;
    setDeleteReviewError(null);
    try {
      await deleteReview.mutateAsync(reviewToDelete);
      setReviewToDelete(null);
    } catch {
      setDeleteReviewError('Failed to delete this review. Please try again.');
    }
  }, [deleteReview, reviewToDelete]);

  const handleSignOut = useCallback(async () => {
    const gate = guardSensitiveAction('account_action');
    if (!gate.allowed) {
      Alert.alert('Action blocked', gate.reason || 'This action is blocked on this device.');
      return;
    }
    try {
      try { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
      await signOut();
    } catch {
      Alert.alert('Error', 'Failed to sign out.');
    }
  }, [guardSensitiveAction, signOut]);

  const handleDeleteAccountConfirm = useCallback(async () => {
    const gate = guardSensitiveAction('account_action');
    if (!gate.allowed) {
      setDeleteAccountError(gate.reason || 'This action is blocked on this device.');
      return;
    }
    try { void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch {}
    setDeleteAccountError(null);
    try {
      await deleteAccount.mutateAsync();
      await signOut();
      router.replace(routes.onboarding() as never);
    } catch {
      setDeleteAccountError('Failed to delete account. Please try again.');
    }
  }, [deleteAccount, guardSensitiveAction, router, signOut]);

  const heroMeta = useMemo(() => {
    return [
      profileLocation !== 'Location not set' ? { icon: 'location-outline' as const, label: profileLocation } : null,
      { icon: 'calendar-outline' as const, label: `Member since ${memberSinceLabel}` },
    ].filter(Boolean) as Array<{ icon: keyof typeof Ionicons.glyphMap; label: string }>;
  }, [memberSinceLabel, profileLocation]);

  return {
    badgesCount,
    badgesQuery,
    deleteAccount,
    deleteAccountError,
    deleteReview,
    deleteReviewError,
    displayLabel,
    earnedBadges,
    handleDeleteAccountConfirm,
    handleDeleteReviewConfirm,
    handleEditReview,
    handleRefresh,
    handleSaveProfile,
    handleScroll,
    handleSignOut,
    helpfulVotesCount,
    heroMeta,
    interestsCount,
    isDeleteAccountOpen,
    isEditOpen,
    isRefreshing,
    locationStatus,
    memberSinceLabel,
    profile,
    profileQuery,
    profileSaveError,
    profileSaving,
    requestLocationPermission,
    reviewSectionLoading: reviewsQuery.isLoading,
    reviewToDelete,
    reviewsCount,
    router,
    savedBusinesses,
    savedBusinessesCount,
    setDeleteAccountError,
    setDeleteReviewError,
    setIsDeleteAccountOpen,
    setIsEditOpen,
    setProfileSaveError,
    setReviewToDelete,
    setShowAllContributions,
    showAllContributions,
    showScrollTopButton,
    signOut,
    statsQuery,
    scrollRef,
    updateProfile,
    user,
    userReviews,
  };
}
