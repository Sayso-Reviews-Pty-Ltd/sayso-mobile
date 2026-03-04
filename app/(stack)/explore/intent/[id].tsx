import { useLocalSearchParams } from 'expo-router';
import { BusinessFeedStackScreen } from '../../../../src/screens/shared/BusinessFeedStackScreen';

export default function ExploreIntentRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <BusinessFeedStackScreen
      title={(id || 'Intent').replace(/-/g, ' ')}
      subtitle="Intent-driven discovery route for mobile Explore"
    />
  );
}
