import { StaticContentScreen } from '../../src/screens/shared/StaticContentScreen';

export default function PrivacyRoute() {
  return (
    <StaticContentScreen
      title="Privacy"
      sections={[
        {
          heading: 'Your data',
          body: 'This route is reserved for the mobile privacy policy, data handling disclosures, and account-related privacy controls.',
        },
        {
          heading: 'Permissions',
          body: 'As more native features arrive, this screen can explain location, push notification, and camera permission usage.',
        },
      ]}
    />
  );
}
