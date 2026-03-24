import { useMemo } from 'react';
import { useAllUserBadges } from './useUserBadges';
import { useUserStats } from './useUserStats';

type BadgeRuleType =
  | 'review_count'
  | 'category_review_count'
  | 'distinct_category_count'
  | 'photo_count'
  | 'helpful_votes_total'
  | 'helpful_votes_received'
  | 'streak_days'
  | 'weekly_streak'
  | 'loyal_reviewer';

export interface BadgeProgressItem {
  badgeId: string;
  name: string;
  description: string;
  iconPath: string | null;
  ruleType: BadgeRuleType;
  current: number;
  required: number;
  percent: number;
  remaining: number;
  actionLabel: string;
}

const ACTION_LABEL: Partial<Record<BadgeRuleType, string>> = {
  review_count:            'reviews',
  category_review_count:   'reviews in this category',
  distinct_category_count: 'categories reviewed',
  photo_count:             'reviews with photos',
  helpful_votes_total:     'helpful votes given',
  helpful_votes_received:  'helpful votes received',
  streak_days:             'day streak',
  weekly_streak:           'week streak',
  loyal_reviewer:          'reviews at one business',
};

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val));
}

export function useNextBadgeProgress() {
  const badgesQuery = useAllUserBadges();
  const statsQuery = useUserStats();

  const stats = statsQuery.data?.data;
  const badges = badgesQuery.data;

  const nearestBadges = useMemo<BadgeProgressItem[]>(() => {
    if (!badges || !stats) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (badges as any[])
      .filter((b) => !b.earned && b.threshold != null && b.rule_type)
      .map((b) => {
        const ruleType = b.rule_type as BadgeRuleType;
        let current = 0;
        switch (ruleType) {
          case 'review_count':
          case 'category_review_count':
          case 'loyal_reviewer':
            current = stats.totalReviewsWritten;
            break;
          case 'helpful_votes_total':
            current = stats.totalHelpfulVotesGiven;
            break;
          case 'helpful_votes_received':
            current = stats.helpfulVotesReceived;
            break;
          default:
            current = 0;
        }
        const required = b.threshold as number;
        const percent = clamp(
          required > 0 ? Math.round((current / required) * 100) : 0,
          0,
          100,
        );
        return {
          badgeId:     b.id,
          name:        b.name,
          description: b.description ?? '',
          iconPath:    b.icon_path ?? null,
          ruleType,
          current,
          required,
          percent,
          remaining:   Math.max(0, required - current),
          actionLabel: ACTION_LABEL[ruleType] ?? 'actions',
        } satisfies BadgeProgressItem;
      })
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 3);
  }, [badges, stats]);

  return {
    nearestBadges,
    isLoading: badgesQuery.isLoading || statsQuery.isLoading,
  };
}
