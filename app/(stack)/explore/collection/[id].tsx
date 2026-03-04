import { useLocalSearchParams } from 'expo-router';
import { BusinessFeedScreen } from '../../../../src/screens/shared/BusinessFeedScreen';

export default function ExploreCollectionRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <BusinessFeedScreen
      title={(id || 'Collection').replace(/-/g, ' ')}
      subtitle="Collection-driven discovery route for the Explore tab"
    />
  );
}
