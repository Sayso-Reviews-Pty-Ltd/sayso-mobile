import { View } from 'react-native';
import type { FeaturedBusinessDto } from '@sayso/contracts';
import { BusinessPodium, BusinessRow, InterestFilter } from '../../../components/leaderboard';
import { LeaderboardEmptyState } from './LeaderboardEmptyState';
import { LeaderboardExpandButton } from './LeaderboardExpandButton';
import { LeaderboardLoadingState } from './LeaderboardLoadingState';
import { styles } from './styles';

type Props = {
  availableInterestIds: string[];
  isLoading: boolean;
  onSelectInterest: (id: string) => void;
  onToggleShowAll: () => void;
  selectedInterest: string;
  showAll: boolean;
  sortedBusinesses: FeaturedBusinessDto[];
  visibleBusinesses: FeaturedBusinessDto[];
};

export function BusinessesSection({
  availableInterestIds,
  isLoading,
  onSelectInterest,
  onToggleShowAll,
  selectedInterest,
  showAll,
  sortedBusinesses,
  visibleBusinesses,
}: Props) {
  return (
    <>
      {availableInterestIds.length > 0 ? (
        <InterestFilter
          availableIds={availableInterestIds}
          selected={selectedInterest}
          onSelect={onSelectInterest}
        />
      ) : null}

      {isLoading ? (
        <LeaderboardLoadingState />
      ) : sortedBusinesses.length === 0 ? (
        <LeaderboardEmptyState icon="storefront-outline" message="No businesses yet." />
      ) : (
        <>
          <BusinessPodium businesses={sortedBusinesses} />
          <View style={styles.list}>
            {visibleBusinesses.map((business, index) => (
              <BusinessRow key={business.id} business={business} rank={index + 1} />
            ))}
          </View>
          {sortedBusinesses.length > 5 ? (
            <LeaderboardExpandButton expanded={showAll} onPress={onToggleShowAll} />
          ) : null}
        </>
      )}
    </>
  );
}
