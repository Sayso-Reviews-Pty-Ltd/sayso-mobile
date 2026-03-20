import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { TransitionItem } from '../../../components/motion/TransitionItem';
import { ScreenTransitionScope } from '../../../components/motion/TransitionScope';
import { ConfirmationDialog } from '../../../components/profile/ConfirmationDialog';
import { EditProfileModal } from '../../../components/profile/EditProfileModal';
import { routes } from '../../../navigation/routes';
import { OFF_WHITE } from './constants';
import { useProfileScreenController } from './useProfileScreenController';
import {
  ProfileAccountActionsSection,
  ProfileBadgesSection,
  ProfileContributionsSection,
  ProfileEmptyState,
  ProfileHeroCard,
  ProfilePreferencesSection,
  ProfileSavedBusinessesSection,
  ProfileSkeleton,
  ProfileStatsGrid,
} from './components';

export default function ProfileScreen() {
  const controller = useProfileScreenController();

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
            <RefreshControl refreshing={controller.isRefreshing} onRefresh={controller.handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
          onScroll={controller.handleScroll}
          scrollEventThrottle={16}
        >
          {controller.profileQuery.isLoading && !controller.profile ? (
            <TransitionItem variant="card" index={0}>
              <ProfileSkeleton />
            </TransitionItem>
          ) : (
            <>
              <TransitionItem variant="card" index={0}>
                <ProfileHeroCard
                  avatarUrl={controller.profile?.avatar_url}
                  displayLabel={controller.displayLabel}
                  isTopReviewer={controller.profile?.is_top_reviewer}
                  bio={controller.profile?.bio}
                  heroMeta={controller.heroMeta}
                  reviewsCount={controller.reviewsCount}
                  onEditProfile={() => {
                    try { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                    controller.setIsEditOpen(true);
                  }}
                />
              </TransitionItem>

              <TransitionItem variant="card" index={1}>
                <ProfileStatsGrid
                  helpfulVotesCount={controller.helpfulVotesCount}
                  reviewsCount={controller.reviewsCount}
                  badgesCount={controller.badgesCount}
                  interestsCount={controller.interestsCount}
                  savedBusinessesCount={controller.savedBusinessesCount}
                  onViewSaved={() => controller.router.push(routes.saved() as never)}
                />
              </TransitionItem>

              <TransitionItem variant="card" index={2}>
                <ProfileSavedBusinessesSection
                  savedBusinesses={controller.savedBusinesses}
                  onViewAll={() => controller.router.push(routes.saved() as never)}
                />
              </TransitionItem>

              <TransitionItem variant="card" index={3}>
                <ProfileBadgesSection
                  badges={controller.earnedBadges}
                  isLoading={controller.badgesQuery.isLoading}
                  onViewAll={() => controller.router.push(routes.achievements() as never)}
                />
              </TransitionItem>

              <TransitionItem variant="card" index={4}>
                <ProfileContributionsSection
                  reviews={controller.userReviews}
                  isLoading={controller.reviewSectionLoading}
                  showAllContributions={controller.showAllContributions}
                  onToggleShowAll={() =>
                    controller.setShowAllContributions((current) => !current)
                  }
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

              <TransitionItem variant="card" index={5}>
                <ProfilePreferencesSection
                  locationStatus={controller.locationStatus}
                  onRequestLocationPermission={controller.requestLocationPermission}
                />
              </TransitionItem>

              <TransitionItem variant="card" index={6}>
                <ProfileAccountActionsSection
                  onSignOut={controller.handleSignOut}
                  onChangePassword={() =>
                    controller.router.push(routes.changePassword() as never)
                  }
                  onDeleteAccount={() => {
                    controller.setDeleteAccountError(null);
                    controller.setIsDeleteAccountOpen(true);
                  }}
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
    paddingBottom: 34,
    gap: 10,
  },
});
