import { useLocalSearchParams } from 'expo-router';
import { BusinessFeedScreen } from '../../../../src/screens/shared/BusinessFeedScreen';

export default function CategoryRoute() {
  const { category } = useLocalSearchParams<{ category: string }>();

  return (
    <BusinessFeedScreen
      title={(category || 'Category').replace(/-/g, ' ')}
      subtitle="Category feed in the shared Explore stack"
    />
  );
}
