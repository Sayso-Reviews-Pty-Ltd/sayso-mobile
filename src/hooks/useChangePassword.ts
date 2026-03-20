import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: { newPassword: string }) =>
      apiFetch<{ success?: boolean; error?: string }>('/api/user/change-password', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  });
}
