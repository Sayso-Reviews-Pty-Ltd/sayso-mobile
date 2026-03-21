import { View } from 'react-native';
import { ContributorPodium, ContributorRow } from '../../../components/leaderboard';
import { LeaderboardEmptyState } from './LeaderboardEmptyState';
import { LeaderboardErrorState } from './LeaderboardErrorState';
import { LeaderboardExpandButton } from './LeaderboardExpandButton';
import { LeaderboardLoadingState } from './LeaderboardLoadingState';
import { styles } from './styles';

type Props = {
  hasError: boolean;
  isLoading: boolean;
  onRetry: () => void;
  onToggleShowAll: () => void;
  reviewers: any[];
  showAll: boolean;
  visibleReviewers: any[];
};

export function ContributorsSection({
  hasError,
  isLoading,
  onRetry,
  onToggleShowAll,
  reviewers,
  showAll,
  visibleReviewers,
}: Props) {
  if (isLoading) {
    return <LeaderboardLoadingState />;
  }

  if (hasError) {
    return <LeaderboardErrorState onRetry={onRetry} />;
  }

  if (reviewers.length === 0) {
    return (
      <LeaderboardEmptyState
        icon="trophy-outline"
        message="No contributors yet. Be the first to write a review!"
      />
    );
  }

  return (
    <>
      <ContributorPodium reviewers={reviewers} />
      <View style={styles.list}>
        {visibleReviewers.map((reviewer, index) => (
          <ContributorRow key={reviewer.id} reviewer={reviewer} rank={index + 1} />
        ))}
      </View>
      {reviewers.length > 5 ? (
        <LeaderboardExpandButton expanded={showAll} onPress={onToggleShowAll} />
      ) : null}
    </>
  );
}
