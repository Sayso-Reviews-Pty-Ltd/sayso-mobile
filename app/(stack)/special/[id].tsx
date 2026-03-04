import { useLocalSearchParams } from 'expo-router';
import { PlaceholderScreen } from '../../../src/screens/shared/PlaceholderScreen';
import { routes } from '../../../src/navigation/routes';

export default function SpecialDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <PlaceholderScreen
      title="Special Detail"
      description={`This mobile special detail route is wired for ID "${id}". It keeps the navigation contract stable while the special-specific content layer is built out.`}
      actions={[{ label: 'Write special review', href: routes.writeReview('special', id || 'unknown') }]}
    />
  );
}
