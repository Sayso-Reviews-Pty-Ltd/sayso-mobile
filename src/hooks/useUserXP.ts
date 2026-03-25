import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { useAuthSession } from './useSession';
import { currentLevelFromXP, type LevelState } from '../lib/xp/levels';

interface RawXPData {
  total_xp: number;
  current_level: number;
  updated_at: string | null;
}

export interface UserXPData extends LevelState {
  totalXP: number;
  updatedAt: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUserXP(): UserXPData {
  const { user, isLoading: sessionLoading } = useAuthSession();

  const query = useQuery({
    queryKey: ['user-xp', user?.id],
    queryFn: () => apiFetch<RawXPData>('/api/user/xp'),
    enabled: Boolean(user) && !sessionLoading,
    staleTime: 30_000,
    retry: 1,
});

  const levelState = currentLevelFromXP(query.data?.total_xp ?? 0);

  return {
    ...levelState,
    totalXP: query.data?.total_xp ?? 0,
    updatedAt: query.data?.updated_at ?? null,
    isLoading: query.isLoading,
    error: query.error ? String((query.error as Error).message ?? query.error) : null,
    refetch: query.refetch,
  };
}
