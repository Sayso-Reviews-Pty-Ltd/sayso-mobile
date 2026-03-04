import { useLocalSearchParams } from 'expo-router';
import { BusinessFeedScreen } from '../../../../src/screens/shared/BusinessFeedScreen';

export default function ExploreCategoryRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <BusinessFeedScreen
      title={(id || 'Explore Category').replace(/-/g, ' ')}
      subtitle="Explore-category route mounted under the shared push stack"
    />
  );
}
