import { PlaceholderScreen } from '../../../src/screens/shared/PlaceholderScreen';
import { routes } from '../../../src/navigation/routes';

export default function OnboardingRoute() {
  return (
    <PlaceholderScreen
      title="Onboarding"
      description="This full-screen modal route will host the mobile onboarding flow and can reuse the interests and deal-breakers routes as needed."
      actions={[{ label: 'Choose account type', href: routes.selectAccountType() }]}
    />
  );
}
