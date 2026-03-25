import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import type { NotificationsResponseDto } from '@sayso/contracts';

export function useNotificationsList(limit = 30) {
  return useQuery({
    queryKey: ['notifications-list', limit],
    queryFn: () =>
      apiFetch<NotificationsResponseDto>(`/api/notifications/user?limit=${limit}`),
    staleTime: 15_000,
    retry: 1,
});
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch('/api/notifications/user/mark-all-read', { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications-list'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkOneRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/notifications/user/${id}/mark-read`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications-list'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDismissNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/notifications/user/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications-list'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
