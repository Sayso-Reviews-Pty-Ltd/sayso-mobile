import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export interface ChangeEmailPayload {
  newEmail: string;
}

export function useChangeEmail() {
  return useMutation({
    mutationFn: (payload: ChangeEmailPayload) =>
      apiFetch<{ success?: boolean; error?: string }>('/api/user/change-email', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  });
}

export function useResendEmailChange() {
  return useMutation({
    mutationFn: (payload: ChangeEmailPayload) =>
      apiFetch<{ success?: boolean; error?: string }>('/api/user/change-email/resend', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  });
}
