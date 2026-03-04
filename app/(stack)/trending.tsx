import { BusinessFeedStackScreen } from '../../src/screens/shared/BusinessFeedStackScreen';

export default function TrendingRoute() {
  return (
    <BusinessFeedStackScreen
      title="Trending"
      subtitle="What people around you are rating and saving right now"
      count={50}
    />
  );
}
