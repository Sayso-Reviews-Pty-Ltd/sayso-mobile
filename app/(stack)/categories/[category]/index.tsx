import { useLocalSearchParams } from 'expo-router';
import { BusinessFeedStackScreen } from '../../../../src/screens/shared/BusinessFeedStackScreen';

export default function CategoryRoute() {
  const { category } = useLocalSearchParams<{ category: string }>();

  return (
    <BusinessFeedStackScreen
      title={(category || 'Category').replace(/-/g, ' ')}
      subtitle="Category feed in the shared Explore stack"
    />
  );
}
