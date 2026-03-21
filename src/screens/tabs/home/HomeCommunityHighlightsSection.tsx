import { View } from 'react-native';
import { HomeSectionHeader } from './HomeSectionHeader';
import { FeaturedBusinessesStrip } from './community-highlights/FeaturedBusinessesStrip';
import { ReviewerCarousel } from './community-highlights/ReviewerCarousel';
import { styles } from './community-highlights/styles';
import type { HomeCommunityHighlightsProps } from './community-highlights/types';

export function HomeCommunityHighlightsSection({
  reviewers,
  reviewersMode = 'stage1',
  recentReviews,
  reviewersLoading,
  reviewersError,
  featuredBusinesses,
  featuredLoading,
  featuredError,
  onPressContributors,
  onPressFeatured,
  onPressBadges,
}: HomeCommunityHighlightsProps) {
  return (
    <View style={styles.section}>
      <HomeSectionHeader title="Community Highlights" />

      <ReviewerCarousel
        reviewers={reviewers}
        recentReviews={recentReviews}
        reviewersMode={reviewersMode}
        reviewersLoading={reviewersLoading}
        reviewersError={reviewersError}
        onPressContributors={onPressContributors}
        onPressBadges={onPressBadges}
      />

      <FeaturedBusinessesStrip
        featuredBusinesses={featuredBusinesses}
        featuredLoading={featuredLoading}
        featuredError={featuredError}
        onPressFeatured={onPressFeatured}
      />
    </View>
  );
}
