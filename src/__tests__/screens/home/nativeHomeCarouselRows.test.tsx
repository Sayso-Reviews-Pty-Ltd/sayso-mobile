import { render } from '@testing-library/react-native';
import { HomeBusinessRow } from '../../../screens/tabs/home/HomeBusinessRow';
import { HomeEventsSpecialsRow } from '../../../screens/tabs/home/HomeEventsSpecialsRow';
import { ReviewerCarousel } from '../../../screens/tabs/home/community-highlights/ReviewerCarousel';
import { useNativeHomeCarouselEnabled } from '../../../screens/tabs/home/carousel/useNativeHomeCarouselEnabled';

jest.mock('../../../screens/tabs/home/carousel/useNativeHomeCarouselEnabled', () => ({
  useNativeHomeCarouselEnabled: jest.fn(),
}));

jest.mock('../../../components/BusinessCard', () => ({
  BusinessCard: ({ business: _business }: { business: { id: string } }) => null,
}));

jest.mock('../../../components/EventCard', () => ({
  EventCard: ({ item: _item }: { item: { id: string } }) => null,
}));

jest.mock('../../../components/reviewer-card/ReviewerCard', () => ({
  ReviewerCard: ({ reviewer: _reviewer }: { reviewer: { id: string } }) => null,
}));

jest.mock('../../../components/InlineErrorBanner', () => ({
  InlineErrorBanner: () => null,
}));

jest.mock('../../../components/SkeletonCard', () => ({
  SkeletonCard: () => null,
}));

jest.mock('../../../components/EventCardSkeleton', () => ({
  EventCardSkeleton: () => null,
}));

jest.mock('../../../screens/tabs/home/community-highlights/CommunityBadgeMarquee', () => ({
  CommunityBadgeMarquee: () => null,
}));

const mockedUseNativeHomeCarouselEnabled = useNativeHomeCarouselEnabled as jest.MockedFunction<
  typeof useNativeHomeCarouselEnabled
>;

describe('home rows native carousel gating', () => {
  beforeEach(() => {
    mockedUseNativeHomeCarouselEnabled.mockReturnValue(false);
  });

  it('renders native carousel for HomeBusinessRow when gate is enabled', () => {
    mockedUseNativeHomeCarouselEnabled.mockReturnValue(true);

    const view = render(
      <HomeBusinessRow
        items={[{ id: 'biz-1' } as any]}
        loading={false}
        emptyTitle="empty"
        emptyMessage="empty"
      />,
    );

    expect(view.queryByTestId('home-business-row-native-carousel')).toBeTruthy();
    expect(view.queryByTestId('home-business-row-flatlist')).toBeNull();
  });

  it('keeps FlatList fallback for HomeBusinessRow when gate is disabled', () => {
    const view = render(
      <HomeBusinessRow
        items={[{ id: 'biz-1' } as any]}
        loading={false}
        emptyTitle="empty"
        emptyMessage="empty"
      />,
    );

    expect(view.queryByTestId('home-business-row-flatlist')).toBeTruthy();
    expect(view.queryByTestId('home-business-row-native-carousel')).toBeNull();
  });

  it('renders native carousel for HomeEventsSpecialsRow when gate is enabled', () => {
    mockedUseNativeHomeCarouselEnabled.mockReturnValue(true);

    const view = render(
      <HomeEventsSpecialsRow items={[{ id: 'evt-1', type: 'event' } as any]} loading={false} />,
    );

    expect(view.queryByTestId('home-events-row-native-carousel')).toBeTruthy();
    expect(view.queryByTestId('home-events-row-flatlist')).toBeNull();
  });

  it('keeps FlatList fallback for HomeEventsSpecialsRow when gate is disabled', () => {
    const view = render(
      <HomeEventsSpecialsRow items={[{ id: 'evt-1', type: 'event' } as any]} loading={false} />,
    );

    expect(view.queryByTestId('home-events-row-flatlist')).toBeTruthy();
    expect(view.queryByTestId('home-events-row-native-carousel')).toBeNull();
  });

  it('renders native carousel for ReviewerCarousel when gate is enabled', () => {
    mockedUseNativeHomeCarouselEnabled.mockReturnValue(true);

    const view = render(
      <ReviewerCarousel
        reviewers={[{ id: 'rev-1' } as any]}
        recentReviews={[]}
        reviewersMode="normal"
        reviewersLoading={false}
        onPressContributors={() => {}}
        onPressBadges={() => {}}
      />,
    );

    expect(view.queryByTestId('reviewer-row-native-carousel')).toBeTruthy();
    expect(view.queryByTestId('reviewer-row-flatlist')).toBeNull();
  });

  it('keeps FlatList fallback for ReviewerCarousel when gate is disabled', () => {
    const view = render(
      <ReviewerCarousel
        reviewers={[{ id: 'rev-1' } as any]}
        recentReviews={[]}
        reviewersMode="normal"
        reviewersLoading={false}
        onPressContributors={() => {}}
        onPressBadges={() => {}}
      />,
    );

    expect(view.queryByTestId('reviewer-row-flatlist')).toBeTruthy();
    expect(view.queryByTestId('reviewer-row-native-carousel')).toBeNull();
  });
});
