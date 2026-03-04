import { useLocalSearchParams } from 'expo-router';
import { BusinessFeedStackScreen } from '../../../../src/screens/shared/BusinessFeedStackScreen';

export default function ExploreCollectionRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <BusinessFeedStackScreen
      title={(id || 'Collection').replace(/-/g, ' ')}
      subtitle="Collection-driven discovery route for the Explore tab"
    />
  );
}
