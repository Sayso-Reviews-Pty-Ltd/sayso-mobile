import { useLocalSearchParams } from 'expo-router';
import { PlaceholderScreen } from '../../../src/screens/shared/PlaceholderScreen';

export default function ReviewerProfileRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <PlaceholderScreen
      title="Reviewer Profile"
      description={`Reviewer route "${id}" is available in the shared stack. This is where reviewer-specific stats, reviews, and badges can be rendered once the mobile surface is built.`}
    />
  );
}
