import { Pressable, ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, GRID } from './reviewer-profile/constants';
import { ReviewerBadgesSection } from './reviewer-profile/ReviewerBadgesSection';
import { ReviewerErrorState } from './reviewer-profile/ReviewerErrorState';
import { ReviewerProfileHeader } from './reviewer-profile/ReviewerProfileHeader';
import { ReviewerReviewsSection } from './reviewer-profile/ReviewerReviewsSection';
import { ReviewerSkeleton } from './reviewer-profile/ReviewerSkeleton';
import { ReviewerStatsSection } from './reviewer-profile/ReviewerStatsSection';
import { styles } from './reviewer-profile/styles';
import { useReviewerProfileController } from './reviewer-profile/useReviewerProfileController';

export default function ReviewerProfileScreen() {
  const {
    contentOpacity,
    contentY,
    displayedReviews,
    error,
    handleBack,
    headerOpacity,
    headerY,
    imgError,
    insets,
    isLoading,
    onImageError,
    reviewer,
    showAllReviews,
    toggleShowAllReviews,
  } = useReviewerProfileController();

  return (
    <View style={[styles.root, { backgroundColor: C.page }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.backBtnWrap, { top: insets.top + GRID * 1.5 }]}>
        <Pressable style={styles.backBtn} onPress={handleBack} hitSlop={12}>
          <Ionicons name="chevron-back-outline" size={22} color={C.charcoal} />
        </Pressable>
      </View>

      {isLoading ? (
        <ReviewerSkeleton />
      ) : error || !reviewer ? (
        <ReviewerErrorState onBack={handleBack} />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + GRID * 8, paddingBottom: insets.bottom + GRID * 4 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <ReviewerProfileHeader
            headerOpacity={headerOpacity}
            headerY={headerY}
            imgError={imgError}
            onImageError={onImageError}
            reviewer={reviewer}
          />

          <ReviewerStatsSection
            contentOpacity={contentOpacity}
            contentY={contentY}
            reviewer={reviewer}
          />

          <ReviewerBadgesSection
            badges={reviewer.badges}
            contentOpacity={contentOpacity}
            contentY={contentY}
          />

          <ReviewerReviewsSection
            contentOpacity={contentOpacity}
            contentY={contentY}
            displayedReviews={displayedReviews}
            reviewer={reviewer}
            showAllReviews={showAllReviews}
            onToggleShowAll={toggleShowAllReviews}
          />
        </ScrollView>
      )}
    </View>
  );
}
