import { useLocalSearchParams } from 'expo-router';
import { PlaceholderScreen } from '../../../src/screens/shared/PlaceholderScreen';
import { routes } from '../../../src/navigation/routes';

export default function PublicProfileRoute() {
  const { username } = useLocalSearchParams<{ username: string }>();

  return (
    <PlaceholderScreen
      title={`@${username || 'profile'}`}
      description="Public profile routing is now part of the mobile stack. This screen can host public stats, reviews, badges, and follow-style actions when that API surface is ready."
      actions={[{ label: 'Back to my profile', href: routes.profile() }]}
    />
  );
}
