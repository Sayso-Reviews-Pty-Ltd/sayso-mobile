import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import type { MobileSessionProfileDto } from '@sayso/contracts';

interface ProfileResponse {
  data: MobileSessionProfileDto & {
    email?: string;
    review_count?: number;
    badge_count?: number;
  };
  error: null | { message: string };
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => apiFetch<ProfileResponse>('/api/user/profile'),
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { display_name?: string; username?: string }) =>
      apiFetch('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });
}
