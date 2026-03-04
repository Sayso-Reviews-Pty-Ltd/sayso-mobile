import { useLocalSearchParams } from 'expo-router';
import { PlaceholderScreen } from '../../src/screens/shared/PlaceholderScreen';

export default function LeaderboardRoute() {
  const { tab } = useLocalSearchParams<{ tab?: 'contributors' | 'businesses' }>();

  if (tab === 'contributors') {
    return (
      <PlaceholderScreen
        title="Top Contributors"
        description="This route is ready for the contributor leaderboard. Home now deep-links here from Community Highlights so the navigation contract matches the web experience."
      />
    );
  }

  if (tab === 'businesses') {
    return (
      <PlaceholderScreen
        title="Featured Businesses"
        description="This route is ready for the businesses leaderboard. Home now deep-links here from Featured Businesses of the Month by Category."
      />
    );
  }

  return (
    <PlaceholderScreen
      title="Leaderboard"
      description="This route will host the combined mobile leaderboard for contributors and featured businesses."
    />
  );
}
