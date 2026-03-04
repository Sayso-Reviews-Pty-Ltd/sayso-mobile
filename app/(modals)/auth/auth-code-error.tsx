import { PlaceholderScreen } from '../../../src/screens/shared/PlaceholderScreen';
import { routes } from '../../../src/navigation/routes';

export default function AuthCodeErrorRoute() {
  return (
    <PlaceholderScreen
      title="Authentication Error"
      description="The sign-in callback did not complete correctly. This route provides a stable recovery screen for OAuth and deep-link auth failures."
      actions={[{ label: 'Try sign in again', href: routes.login() }]}
    />
  );
}
