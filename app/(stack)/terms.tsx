import { StaticContentScreen } from '../../src/screens/shared/StaticContentScreen';

export default function TermsRoute() {
  return (
    <StaticContentScreen
      title="Terms"
      sections={[
        {
          heading: 'Service terms',
          body: 'This route is ready for the mobile terms of service and any consumer-specific usage rules.',
        },
        {
          heading: 'Reviews and conduct',
          body: 'It is also the right place for policy language around reviews, moderation, and acceptable use.',
        },
      ]}
    />
  );
}
