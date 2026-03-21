import { useRouter } from 'expo-router';
import { useAuth } from '../../providers/AuthProvider';
import { routes } from '../../navigation/routes';
import { ReviewerVariantCard } from './ReviewerVariantCard';
import { ReviewVariantCard } from './ReviewVariantCard';
import type { ReviewerCardProps } from './types';

export type { BadgeType, ReviewerCardProps } from './types';

export function ReviewerCard(props: ReviewerCardProps) {
  const router = useRouter();
  const { user } = useAuth();

  if (props.variant === 'reviewer') {
    const { reviewer, latestReview } = props;
    const isOwnCard = !!user && user.id === reviewer.id;
    const href = isOwnCard ? routes.profile() : routes.reviewer(reviewer.id);

    return (
      <ReviewerVariantCard
        reviewer={reviewer}
        latestReview={latestReview}
        onPress={() => router.push(href as any)}
      />
    );
  }

  const { review } = props;
  const reviewer = review.reviewer;
  const isOwnCard = !!user && user.id === reviewer.id;
  const href = isOwnCard ? routes.profile() : routes.reviewer(reviewer.id);

  return <ReviewVariantCard review={review} onPress={() => router.push(href as any)} />;
}
