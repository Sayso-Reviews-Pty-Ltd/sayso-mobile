import { useLocalSearchParams } from 'expo-router';
import { BusinessFeedStackScreen } from '../../../src/screens/shared/BusinessFeedStackScreen';

export default function CategorySlugRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  return (
    <BusinessFeedStackScreen
      title={(slug || 'Category').replace(/-/g, ' ')}
      subtitle="Slug-based category route kept for parity with the web app"
    />
  );
}
