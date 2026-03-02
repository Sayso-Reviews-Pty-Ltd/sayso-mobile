import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import type { SavedBusinessDto, SavedBusinessesResponseDto } from '@sayso/contracts';

export function useSavedBusinesses() {
  return useQuery({
    queryKey: ['saved-businesses'],
    queryFn: () => apiFetch<SavedBusinessesResponseDto>('/api/user/saved'),
    staleTime: 30_000,
  });
}

export function useSaveBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (businessId: string) =>
      apiFetch('/api/user/saved', {
        method: 'POST',
        body: JSON.stringify({ business_id: businessId }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['saved-businesses'] }),
  });
}

export function useUnsaveBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (businessId: string) =>
      apiFetch(`/api/user/saved?business_id=${businessId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['saved-businesses'] }),
  });
}
