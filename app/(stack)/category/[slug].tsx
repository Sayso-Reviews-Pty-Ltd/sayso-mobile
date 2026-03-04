import { useLocalSearchParams } from 'expo-router';
import { BusinessFeedScreen } from '../../../src/screens/shared/BusinessFeedScreen';

export default function CategorySlugRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  return (
    <BusinessFeedScreen
      title={(slug || 'Category').replace(/-/g, ' ')}
      subtitle="Slug-based category route kept for parity with the web app"
    />
  );
}
