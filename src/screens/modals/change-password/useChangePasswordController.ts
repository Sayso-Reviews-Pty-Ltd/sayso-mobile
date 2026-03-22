import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { useAuthSession } from '../../../hooks/useSession';
import { useChangePassword } from '../../../hooks/useChangePassword';

type Field = 'current' | 'new' | 'confirm';

export function useChangePasswordController() {
  const router = useRouter();
  const { user } = useAuthSession();
  const changePassword = useChangePassword();

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [visible, setVisible] = useState<Partial<Record<Field, boolean>>>({});
  const [focused, setFocused] = useState<Field | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSignedOut, setIsSignedOut] = useState(false);
  const isSubmittingRef = useRef(false);

  const currentError = touched.current && !currentPw ? 'Current password is required.' : '';
  const newError =
    touched.new && !newPw ? 'New password is required.' :
    touched.new && [...newPw].length < 6 ? 'Use at least 6 characters.' : '';
  const confirmError =
    touched.confirm && !confirmPw ? 'Please confirm your password.' :
    touched.confirm && confirmPw !== newPw ? 'Passwords do not match.' : '';

  const isValid = !currentError && !newError && !confirmError &&
    !!currentPw && [...newPw].length >= 6 && confirmPw === newPw;
  const formDisabled = changePassword.isPending || isSignedOut;

  const touch = (field: Field) => setTouched((t) => ({ ...t, [field]: true }));
  const toggleVisible = (field: Field) => setVisible((v) => ({ ...v, [field]: !v[field] }));
  const setFieldFocused = (field: Field | null) => setFocused(field);

  const handleSubmit = useCallback(async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    try {
      setTouched({ current: true, new: true, confirm: true });
      if (!isValid || changePassword.isPending || isSignedOut) return;
      setError('');

      if (!user?.email) {
        setError('You are not signed in. Please sign in again before changing your password.');
        return;
      }

      const currentPassword = currentPw.trim();
      const newPassword = newPw.trim();

      if (currentPassword === newPassword) {
        setError('Your new password must be different from your current password.');
        return;
      }

      if ([...newPassword].length > 72) {
        setError('Password must be 72 characters or fewer.');
        return;
      }

      // ── Step 1: verify current password ────────────────────────────────────
      let authVerified = false;
      try {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });
        if (authError) {
          const isCredentialError =
            authError.code === 'invalid_grant' ||
            authError.message?.includes('Email not confirmed') ||
            authError.message?.includes('Invalid login credentials');

          if (isCredentialError) {
            const isOAuthOnly =
              Array.isArray(user.identities) &&
              user.identities.length > 0 &&
              !user.identities.some((id) => id.provider === 'email');

            if (isOAuthOnly) {
              setError(
                "Your account uses Google sign-in and does not have a password. Use 'Forgot password' to set one via email.",
              );
              return;
            }
          }

          setError('Current password is incorrect.');
          return;
        }
        authVerified = true;
      } catch {
        setError('Failed to update password. Please try again.');
        return;
      }

      // ── Step 2: update password ─────────────────────────────────────────────
      if (!authVerified) return;
      try {
        await changePassword.mutateAsync({ newPassword });
        setSuccess(true);
      } catch {
        try {
          await supabase.auth.signOut();
        } catch {
          // Continue to signed-out recovery UI even if sign-out call fails.
        }
        setError('');
        setIsSignedOut(true);
      }
    } finally {
      isSubmittingRef.current = false;
    }
  }, [isValid, changePassword, user, currentPw, newPw, isSignedOut]);

  return {
    router,
    currentPw, setCurrentPw,
    newPw, setNewPw,
    confirmPw, setConfirmPw,
    visible, toggleVisible,
    focused, setFieldFocused,
    touch,
    error,
    success,
    isSignedOut,
    currentError, newError, confirmError,
    isValid, formDisabled,
    isPending: changePassword.isPending,
    handleSubmit,
  };
}
