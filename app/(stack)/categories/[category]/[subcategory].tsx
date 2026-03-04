import { useLocalSearchParams } from 'expo-router';
import { BusinessFeedScreen } from '../../../../src/screens/shared/BusinessFeedScreen';

export default function SubcategoryRoute() {
  const { subcategory } = useLocalSearchParams<{ subcategory: string }>();

  return (
    <BusinessFeedScreen
      title={(subcategory || 'Subcategory').replace(/-/g, ' ')}
      subtitle="Subcategory drill-down under the Explore taxonomy stack"
    />
  );
}
