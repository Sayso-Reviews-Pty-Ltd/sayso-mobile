import { useLocalSearchParams } from 'expo-router';
import { BusinessFeedScreen } from '../../../../src/screens/shared/BusinessFeedScreen';

export default function ExploreAreaRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <BusinessFeedScreen
      title={(id || 'Area').replace(/-/g, ' ')}
      subtitle="Area-based discovery under the Explore tab stack"
    />
  );
}
