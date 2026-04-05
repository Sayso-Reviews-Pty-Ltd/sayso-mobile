import { useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { haptics } from '../../../lib/haptics';
import { TransitionItem } from '../../../components/motion/TransitionItem';
import { ScreenTransitionScope } from '../../../components/motion/TransitionScope';
import { ConfirmationDialog } from '../../../components/profile/ConfirmationDialog';
import { EditProfileModal } from '../../../components/profile/EditProfileModal';
import { routes } from '../../../navigation/routes';
import { OFF_WHITE } from './constants';
import { useProfileScreenController } from './useProfileScreenController';
import { getPrestigeInfo } from '../../../lib/prestige';
import { track } from '../../../lib/telemetry';
import {
  ProfileAccountActionsSection,
  ProfileBadgesSection,
  ProfileContributionsSection,
  ProfileEmptyState,
  ProfileHeroCard,
  ProfilePreferencesSection,
  ProfilePrestigeBanner,
  ProfileSavedBusinessesSection,
  ProfileSkeleton,
  ProfileStatsGrid,
} from './components';

export default function ProfileScreen() {
  const controller = useProfileScreenController();
  const prestige = getPrestigeInfo(controller.reviewsCount);

  useEffect(() => {
    if (!controller.profileQuery.isLoading && controller.user) {
      track('prestige.profile_viewed', { tier: prestige.tier });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controller.profileQuery.isLoading, controller.user]);

  if (!controller.user) {
    return (
      <SafeAreaView style={styles.container}>
        <ProfileEmptyState onSignIn={() => controller.router.push(routes.onboarding() as never)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenTransitionScope>
        <ScrollView
          ref={controller.scrollRef}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={controller.isRefreshing}
              onRefresh={controller.handleRefresh}
            />
          }
          showsVerticalScrollIndicator={false}
          onScroll={controller.handleScroll}
          scrollEventThrottle={16}
        >
          {controller.profileQuery.isLoading && !controller.profile ? (
            <TransitionItem role="support" index={0}>
              <ProfileSkeleton />
            </TransitionItem>
          ) : (
            <>
              <TransitionItem role="support" index={0}>
                <ProfileHeroCard
                  avatarUrl={controller.profile?.avatar_url}
                  displayLabel={controller.displayLabel}
                  isTopReviewer={controller.profile?.is_top_reviewer}
                  bio={controller.profile?.bio}
                  heroMeta={controller.heroMeta}
                  reviewsCount={controller.reviewsCount}
                  prestige={prestige}
                  onEditProfile={() => {
                    haptics.navigation();
                    controller.setIsEditOpen(true);
                  }}
                />
              </TransitionItem>

              <TransitionItem role="support" index={1}>
                <ProfilePrestigeBanner reviewCount={controller.reviewsCount} />
              </TransitionItem>

              <TransitionItem role="support" index={2}>
                <ProfileStatsGrid
                  helpfulVotesCount={controller.helpfulVotesCount}
                  reviewsCount={controller.reviewsCount}
                  badgesCount={controller.badgesCount}
                  interestsCount={controller.interestsCount}
                  savedBusinessesCount={controller.savedBusinessesCount}
                  onViewSaved={() => controller.router.push(routes.saved() as never)}
                />
              </TransitionItem>

              <TransitionItem role="support" index={3}>
                <ProfileSavedBusinessesSection
                  savedBusinesses={controller.savedBusinesses}
                  onViewAll={() => controller.router.push(routes.saved() as never)}
                />
              </TransitionItem>

              <TransitionItem role="support" index={4}>
                <ProfileBadgesSection
                  badges={controller.earnedBadges}
                  isLoading={controller.badgesQuery.isLoading}
                  onViewAll={() => controller.router.push(routes.achievements() as never)}
                />
              </TransitionItem>

              <TransitionItem role="support" index={5}>
                <ProfileContributionsSection
                  reviews={controller.userReviews}
                  isLoading={controller.reviewSectionLoading}
                  showAllContributions={controller.showAllContributions}
                  onToggleShowAll={() => controller.setShowAllContributions((current) => !current)}
                  onViewBusiness={(businessSlugOrId) =>
                    controller.router.push(routes.businessDetail(businessSlugOrId) as never)
                  }
                  onEditReview={controller.handleEditReview}
                  onDeleteReview={(reviewId) => {
                    controller.setDeleteReviewError(null);
                    controller.setReviewToDelete(reviewId);
                  }}
                />
              </TransitionItem>

              <TransitionItem role="support" index={6}>
                <ProfilePreferencesSection
                  locationStatus={controller.locationStatus}
                  onRequestLocationPermission={controller.requestLocationPermission}
                  onEditPreferences={() =>
                    controller.router.push(routes.editPreferences() as never)
                  }
                />
              </TransitionItem>

              <TransitionItem role="support" index={7}>
                <ProfileAccountActionsSection
                  onSignOut={controller.handleSignOut}
                  onChangePassword={() => controller.router.push(routes.changePassword() as never)}
                  onChangeEmail={() => controller.router.push(routes.changeEmail() as never)}
                  onDeleteAccount={() => {
                    controller.setDeleteAccountError(null);
                    controller.setIsDeleteAccountOpen(true);
                  }}
                  currentEmail={controller.user?.email ?? ''}
                />
              </TransitionItem>
            </>
          )}
        </ScrollView>
      </ScreenTransitionScope>

      <EditProfileModal
        isOpen={controller.isEditOpen}
        onClose={() => {
          if (controller.profileSaving) return;
          controller.setIsEditOpen(false);
          controller.setProfileSaveError(null);
        }}
        onSave={controller.handleSaveProfile}
        currentUsername={controller.profile?.username || ''}
        currentDisplayName={controller.profile?.display_name || null}
        currentAvatarUrl={controller.profile?.avatar_url || null}
        saving={controller.profileSaving || controller.updateProfile.isPending}
        error={controller.profileSaveError}
      />

      <ConfirmationDialog
        isOpen={Boolean(controller.reviewToDelete)}
        onClose={() => {
          if (controller.deleteReview.isPending) return;
          controller.setReviewToDelete(null);
          controller.setDeleteReviewError(null);
        }}
        onConfirm={controller.handleDeleteReviewConfirm}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText={controller.deleteReview.isPending ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        variant="danger"
        isLoading={controller.deleteReview.isPending}
        error={controller.deleteReviewError}
      />

      <ConfirmationDialog
        isOpen={controller.isDeleteAccountOpen}
        onClose={() => {
          if (controller.deleteAccount.isPending) return;
          controller.setIsDeleteAccountOpen(false);
          controller.setDeleteAccountError(null);
        }}
        onConfirm={controller.handleDeleteAccountConfirm}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? This action cannot be undone."
        confirmText={controller.deleteAccount.isPending ? 'Deleting...' : 'Delete Account'}
        cancelText="Cancel"
        variant="danger"
        isLoading={controller.deleteAccount.isPending}
        error={controller.deleteAccountError}
        requireConfirmText="DELETE"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OFF_WHITE,
  },
  content: {
    paddingBottom: 24,
    gap: 12,
  },
});
