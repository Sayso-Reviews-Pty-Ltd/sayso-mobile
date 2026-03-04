import { StaticContentScreen } from '../../src/screens/shared/StaticContentScreen';

export default function AboutRoute() {
  return (
    <StaticContentScreen
      title="About"
      sections={[
        {
          heading: 'What Sayso is',
          body: 'Sayso helps people discover local businesses through reviews, saved places, categories, and personalized discovery feeds.',
        },
        {
          heading: 'Mobile direction',
          body: 'This mobile app mirrors the consumer web information architecture while adapting the experience to tabs, stacks, and focused modal tasks.',
        },
      ]}
    />
  );
}
