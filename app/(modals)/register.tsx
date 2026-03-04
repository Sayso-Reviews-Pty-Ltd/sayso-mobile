import { PlaceholderScreen } from '../../src/screens/shared/PlaceholderScreen';
import { routes } from '../../src/navigation/routes';

export default function RegisterRoute() {
  return (
    <PlaceholderScreen
      title="Create Account"
      description="The register modal route is now part of the app shell. It can host the full mobile sign-up flow without changing navigation structure later."
      actions={[{ label: 'Already have an account? Sign in', href: routes.login() }]}
    />
  );
}
