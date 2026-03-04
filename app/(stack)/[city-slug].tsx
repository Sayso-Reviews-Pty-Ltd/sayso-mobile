import { useLocalSearchParams } from 'expo-router';
import { BusinessFeedScreen } from '../../src/screens/shared/BusinessFeedScreen';

export default function CityRoute() {
  const { 'city-slug': citySlug } = useLocalSearchParams<{ 'city-slug': string }>();
  const title = citySlug ? citySlug.replace(/-/g, ' ') : 'City';

  return (
    <BusinessFeedScreen
      title={title
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')}
      subtitle="City-level discovery route for deep links and localized feeds"
    />
  );
}
