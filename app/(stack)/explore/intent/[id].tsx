import { useLocalSearchParams } from 'expo-router';
import { BusinessFeedScreen } from '../../../../src/screens/shared/BusinessFeedScreen';

export default function ExploreIntentRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <BusinessFeedScreen
      title={(id || 'Intent').replace(/-/g, ' ')}
      subtitle="Intent-driven discovery route for mobile Explore"
    />
  );
}
