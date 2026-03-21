import type { FeaturedBusinessDto, RecentReviewDto, TopReviewerDto } from '@sayso/contracts';

export type HomeCommunityHighlightsProps = {
  reviewers: TopReviewerDto[];
  reviewersMode?: 'stage1' | 'normal';
  recentReviews: RecentReviewDto[];
  reviewersLoading: boolean;
  reviewersError?: string | null;
  featuredBusinesses: FeaturedBusinessDto[];
  featuredLoading: boolean;
  featuredError?: string | null;
  onPressContributors: () => void;
  onPressFeatured: () => void;
  onPressBadges: () => void;
  onPressReviewer: (reviewer: TopReviewerDto) => void;
};
