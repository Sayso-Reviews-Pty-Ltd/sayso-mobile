import { useLocalSearchParams } from 'expo-router';
import { BusinessFeedStackScreen } from '../../../../src/screens/shared/BusinessFeedStackScreen';

export default function SubcategoryRoute() {
  const { subcategory } = useLocalSearchParams<{ subcategory: string }>();

  return (
    <BusinessFeedStackScreen
      title={(subcategory || 'Subcategory').replace(/-/g, ' ')}
      subtitle="Subcategory drill-down under the Explore taxonomy stack"
    />
  );
}
