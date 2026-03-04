import { useLocalSearchParams } from 'expo-router';
import { PlaceholderScreen } from '../../../src/screens/shared/PlaceholderScreen';
import { routes } from '../../../src/navigation/routes';

export default function EventDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <PlaceholderScreen
      title="Event Detail"
      description={`This mobile event detail route is wired for ID "${id}". It can be deep-linked today and will share the same modal review composer once event APIs are connected.`}
      actions={[{ label: 'Write event review', href: routes.writeReview('event', id || 'unknown') }]}
    />
  );
}
