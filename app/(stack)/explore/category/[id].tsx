import { useLocalSearchParams } from 'expo-router';
import { BusinessFeedStackScreen } from '../../../../src/screens/shared/BusinessFeedStackScreen';

export default function ExploreCategoryRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <BusinessFeedStackScreen
      title={(id || 'Explore Category').replace(/-/g, ' ')}
      subtitle="Explore-category route mounted under the shared push stack"
    />
  );
}
