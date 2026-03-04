import { useLocalSearchParams } from 'expo-router';
import { BusinessFeedStackScreen } from '../../src/screens/shared/BusinessFeedStackScreen';

export default function CityRoute() {
  const { 'city-slug': citySlug } = useLocalSearchParams<{ 'city-slug': string }>();
  const title = citySlug ? citySlug.replace(/-/g, ' ') : 'City';

  return (
    <BusinessFeedStackScreen
      title={title
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')}
      subtitle="City-level discovery route for deep links and localized feeds"
    />
  );
}
