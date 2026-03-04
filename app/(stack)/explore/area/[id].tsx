import { useLocalSearchParams } from 'expo-router';
import { BusinessFeedStackScreen } from '../../../../src/screens/shared/BusinessFeedStackScreen';

export default function ExploreAreaRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <BusinessFeedStackScreen
      title={(id || 'Area').replace(/-/g, ' ')}
      subtitle="Area-based discovery under the Explore tab stack"
    />
  );
}
