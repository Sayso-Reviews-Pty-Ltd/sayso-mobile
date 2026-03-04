import { apiFetch } from '../../lib/api';
import { BusinessFeed } from '../../components/feed/BusinessFeed';
import type { PaginatedBusinessFeedResponseDto } from '@sayso/contracts';

type Props = {
  title: string;
  subtitle: string;
  count?: number;
};

function fetchTrendingPage(cursor: string | null, count: number) {
  const params = new URLSearchParams();
  params.set('limit', String(count));
  if (cursor) {
    params.set('cursor', cursor);
  }

  return apiFetch<PaginatedBusinessFeedResponseDto>(`/api/trending?${params.toString()}`);
}

export function BusinessFeedScreen({ title, subtitle, count = 12 }: Props) {
  return (
    <BusinessFeed
      feedKey={`business-feed:${title.toLowerCase()}:${count}`}
      queryKey={['business-feed', title.toLowerCase(), count]}
      subtitle={subtitle}
      errorTitle={`Couldn't load ${title.toLowerCase()}`}
      emptyTitle={`No ${title.toLowerCase()} yet`}
      emptyMessage="Check back shortly for updated recommendations."
      requestLimit={count}
      visibleChunkSize={12}
      fetchPage={(cursor) => fetchTrendingPage(cursor, count)}
    />
  );
}
