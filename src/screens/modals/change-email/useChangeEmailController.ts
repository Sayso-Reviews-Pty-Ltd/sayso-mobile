import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthSession } from '../../../hooks/useSession';
import { useChangeEmail, useResendEmailChange } from '../../../hooks/useChangeEmail';

export type ChangeEmailStep = 'form' | 'pending';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN_SECONDS = 60;

function getApiErrorMessage(e: unknown): string {
  if (e instanceof Error) {
    const msg = e.message.toLowerCase();
    if (msg.includes('already') || msg.includes('in use')) {
      return 'This email address is already in use by another account.';
    }
    if (msg.includes('invalid') || msg.includes('format')) {
      return 'That email address is not valid. Please check and try again.';
    }
  }
  return 'Failed to send verification email. Please try again.';
}

export function useChangeEmailController() {
  const router = useRouter();
  const { user } = useAuthSession();
  const changeEmail = useChangeEmail();
  const resendEmail = useResendEmailChange();

  const [newEmail, setNewEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<ChangeEmailStep>('form');
  const [resendCooldown, setResendCooldown] = useState(0);

  const isSubmittingRef = useRef(false);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentEmail = user?.email ?? '';

  const validateEmail = useCallback(
    (val: string): string => {
      const trimmed = val.trim();
      if (!trimmed) return 'New email address is required.';
      if (!EMAIL_REGEX.test(trimmed)) return 'Enter a valid email address.';
      if (trimmed.toLowerCase() === currentEmail.toLowerCase()) {
        return 'New email must be different from your current email.';
      }
      return '';
    },
    [currentEmail],
  );

  const fieldError = touched ? validateEmail(newEmail) : '';
  const isValid = validateEmail(newEmail) === '';
  const formDisabled = changeEmail.isPending;

  const startCooldown = useCallback(() => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSubmittingRef.current || changeEmail.isPending) return;
    setTouched(true);
    const validationError = validateEmail(newEmail);
    if (validationError) {
      setError(validationError);
      return;
    }
    isSubmittingRef.current = true;
    setError('');
    try {
      await changeEmail.mutateAsync({ newEmail: newEmail.trim().toLowerCase() });
      startCooldown();
      setStep('pending');
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      isSubmittingRef.current = false;
    }
  }, [changeEmail, newEmail, startCooldown, validateEmail]);

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || resendEmail.isPending) return;
    setError('');
    try {
      await resendEmail.mutateAsync({ newEmail: newEmail.trim().toLowerCase() });
      startCooldown();
    } catch {
      setError('Failed to resend verification email. Please try again.');
    }
  }, [newEmail, resendCooldown, resendEmail, startCooldown]);

  const handleCancelPending = useCallback(() => {
    setStep('form');
    setError('');
  }, []);

  return {
    router,
    currentEmail,
    newEmail,
    setNewEmail,
    touched,
    setTouched,
    fieldError,
    error,
    step,
    isValid,
    formDisabled,
    isPending: changeEmail.isPending,
    isResendPending: resendEmail.isPending,
    resendCooldown,
    handleSubmit,
    handleResend,
    handleCancelPending,
  };
}
