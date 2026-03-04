import { StaticContentScreen } from '../../src/screens/shared/StaticContentScreen';

export default function ContactRoute() {
  return (
    <StaticContentScreen
      title="Contact"
      sections={[
        {
          heading: 'Support',
          body: 'Use this route for in-app support contact details, escalation paths, and issue reporting.',
        },
        {
          heading: 'Business inquiries',
          body: 'This screen can also host partnership or business-facing contact information without mixing it into the consumer tab shell.',
        },
      ]}
    />
  );
}
