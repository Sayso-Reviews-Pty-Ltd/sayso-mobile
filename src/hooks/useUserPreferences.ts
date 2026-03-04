import { useQuery } from '@tanstack/react-query';
import type { UserPreferencesResponseDto } from '@sayso/contracts';
import { apiFetch } from '../lib/api';
import { useAuthSession } from './useSession';

const EMPTY_PREFERENCES: UserPreferencesResponseDto = {
  interests: [],
  subcategories: [],
  dealbreakers: [],
};

export function useUserPreferences(enabled = true) {
  const { user } = useAuthSession();

  const query = useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: () => apiFetch<UserPreferencesResponseDto>('/api/user/preferences'),
    enabled: enabled && Boolean(user?.id),
    staleTime: 60_000,
  });

  return {
    interests: query.data?.interests ?? EMPTY_PREFERENCES.interests,
    subcategories: query.data?.subcategories ?? EMPTY_PREFERENCES.subcategories,
    dealbreakers: query.data?.dealbreakers ?? EMPTY_PREFERENCES.dealbreakers,
    isLoading: enabled && Boolean(user?.id) ? query.isLoading : false,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}
