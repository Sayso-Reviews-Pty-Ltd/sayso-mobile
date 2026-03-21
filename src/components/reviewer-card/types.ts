import type { RecentReviewDto, TopReviewerDto } from '@sayso/contracts';

export type BadgeType = 'top' | 'verified' | 'local';

export type ReviewerCardProps =
  | { variant: 'reviewer'; reviewer: TopReviewerDto; latestReview?: RecentReviewDto }
  | { variant?: 'review'; review: RecentReviewDto };
