import { useLocalSearchParams } from 'expo-router';
import { PlaceholderScreen } from '../../../src/screens/shared/PlaceholderScreen';

export default function DMThreadRoute() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();

  return (
    <PlaceholderScreen
      title="Conversation"
      description={`Thread "${threadId}" is routable on mobile. This gives messaging a stable stack destination even before the native conversation UI is implemented.`}
    />
  );
}
