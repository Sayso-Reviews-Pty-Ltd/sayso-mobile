import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import ChangePasswordScreen from '../../screens/modals/ChangePasswordScreen';
import { useAuthSession } from '../../hooks/useSession';
import { useChangePassword } from '../../hooks/useChangePassword';
import '../../lib/supabase';

// ── Router ────────────────────────────────────────────────────────────────────
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ back: mockBack, push: jest.fn() })),
}));

// ── Safe area ─────────────────────────────────────────────────────────────────
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

// ── expo-linear-gradient ──────────────────────────────────────────────────────
jest.mock('expo-linear-gradient', () => {
  const RN = require('react-native');
  return { LinearGradient: RN.View };
});

// ── Auth session ──────────────────────────────────────────────────────────────
jest.mock('../../hooks/useSession', () => ({
  useAuthSession: jest.fn(() => ({ user: { email: 'user@example.com' } })),
}));

// ── useChangePassword ─────────────────────────────────────────────────────────
const mockMutateAsync = jest.fn();
jest.mock('../../hooks/useChangePassword', () => ({
  useChangePassword: jest.fn(() => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  })),
}));

// ── Supabase ──────────────────────────────────────────────────────────────────
const mockSignInWithPassword = jest.fn();
const mockSignOut = jest.fn();
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
    },
  },
}));

// ── Typed mock handles ────────────────────────────────────────────────────────
const mockUseAuthSession = useAuthSession as unknown as jest.Mock;
const mockUseChangePassword = useChangePassword as unknown as jest.Mock;

// ─────────────────────────────────────────────────────────────────────────────

function fillForm(current: string, next: string, confirm: string) {
  fireEvent.changeText(screen.getByPlaceholderText('Your current password'), current);
  fireEvent.changeText(screen.getByPlaceholderText('Create a new password'), next);
  fireEvent.changeText(screen.getByPlaceholderText('Confirm new password'), confirm);
}

describe('ChangePasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthSession.mockReturnValue({ user: { email: 'user@example.com' } });
    mockUseChangePassword.mockReturnValue({ mutateAsync: mockMutateAsync, isPending: false });
    mockMutateAsync.mockResolvedValue({ success: true });
    mockSignInWithPassword.mockResolvedValue({ error: null });
    mockSignOut.mockResolvedValue({});
  });

  // ── Rendering ───────────────────────────────────────────────────────────────

  it('renders the title', () => {
    render(<ChangePasswordScreen />);
    expect(screen.getByText('Change Password')).toBeTruthy();
  });

  it('renders all three password fields', () => {
    render(<ChangePasswordScreen />);
    expect(screen.getByPlaceholderText('Your current password')).toBeTruthy();
    expect(screen.getByPlaceholderText('Create a new password')).toBeTruthy();
    expect(screen.getByPlaceholderText('Confirm new password')).toBeTruthy();
  });

  it('renders the submit button', () => {
    render(<ChangePasswordScreen />);
    expect(screen.getByText('Update Password')).toBeTruthy();
  });

  // ── Validation ──────────────────────────────────────────────────────────────

  it('shows required error for current password when blurred empty', () => {
    render(<ChangePasswordScreen />);
    fireEvent(screen.getByPlaceholderText('Your current password'), 'blur');
    expect(screen.getByText('Current password is required.')).toBeTruthy();
  });

  it('shows required error for new password when blurred empty', () => {
    render(<ChangePasswordScreen />);
    fireEvent(screen.getByPlaceholderText('Create a new password'), 'blur');
    expect(screen.getByText('New password is required.')).toBeTruthy();
  });

  it('shows too-short error when new password is fewer than 6 chars', () => {
    render(<ChangePasswordScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Create a new password'), 'abc');
    fireEvent(screen.getByPlaceholderText('Create a new password'), 'blur');
    expect(screen.getByText('Use at least 6 characters.')).toBeTruthy();
  });

  it('shows mismatch error when confirm does not match new password', () => {
    render(<ChangePasswordScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Create a new password'), 'secret1');
    fireEvent.changeText(screen.getByPlaceholderText('Confirm new password'), 'different');
    fireEvent(screen.getByPlaceholderText('Confirm new password'), 'blur');
    expect(screen.getByText('Passwords do not match.')).toBeTruthy();
  });

  it('shows all validation errors when submitting a blank form', async () => {
    render(<ChangePasswordScreen />);
    await act(async () => {
      fireEvent.press(screen.getByText('Update Password'));
    });
    expect(screen.getByText('Current password is required.')).toBeTruthy();
    expect(screen.getByText('New password is required.')).toBeTruthy();
    expect(screen.getByText('Please confirm your password.')).toBeTruthy();
  });

  it('shows not-signed-in error and does not call supabase when user is null', async () => {
    mockUseAuthSession.mockReturnValue({ user: null });
    render(<ChangePasswordScreen />);
    fillForm('oldpass', 'newpass1', 'newpass1');

    await act(async () => {
      fireEvent.press(screen.getByText('Update Password'));
    });

    expect(screen.getByText('You are not signed in. Please sign in again before changing your password.')).toBeTruthy();
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('shows not-signed-in error and does not call supabase when user.email is missing', async () => {
    mockUseAuthSession.mockReturnValue({ user: { email: undefined } });
    render(<ChangePasswordScreen />);
    fillForm('oldpass', 'newpass1', 'newpass1');

    await act(async () => {
      fireEvent.press(screen.getByText('Update Password'));
    });

    expect(screen.getByText('You are not signed in. Please sign in again before changing your password.')).toBeTruthy();
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('does not call supabase when the form is invalid', async () => {
    render(<ChangePasswordScreen />);
    await act(async () => {
      fireEvent.press(screen.getByText('Update Password'));
    });
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  // ── Submission ──────────────────────────────────────────────────────────────

  it('verifies current password via supabase.auth.signInWithPassword', async () => {
    render(<ChangePasswordScreen />);
    fillForm('oldpass', 'newpass1', 'newpass1');

    await act(async () => {
      fireEvent.press(screen.getByText('Update Password'));
    });

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'oldpass',
    });
  });

  it('calls mutateAsync with the new password after verification succeeds', async () => {
    render(<ChangePasswordScreen />);
    fillForm('oldpass', 'newpass1', 'newpass1');

    await act(async () => {
      fireEvent.press(screen.getByText('Update Password'));
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({ newPassword: 'newpass1' });
  });

  it('shows success state after a successful password change', async () => {
    render(<ChangePasswordScreen />);
    fillForm('oldpass', 'newpass1', 'newpass1');

    await act(async () => {
      fireEvent.press(screen.getByText('Update Password'));
    });

    await waitFor(() => {
      expect(screen.getByText('Password Updated')).toBeTruthy();
      expect(screen.getByText('All set! Your password is now updated.')).toBeTruthy();
    });
  });

  it('shows Done button in success state', async () => {
    render(<ChangePasswordScreen />);
    fillForm('oldpass', 'newpass1', 'newpass1');

    await act(async () => {
      fireEvent.press(screen.getByText('Update Password'));
    });

    await waitFor(() => {
      expect(screen.getByText('Done')).toBeTruthy();
    });
  });

  // ── Error handling ──────────────────────────────────────────────────────────

  it('shows OAuth recovery message when user is OAuth-only and error code is invalid_grant', async () => {
    mockUseAuthSession.mockReturnValue({
      user: {
        email: 'user@example.com',
        identities: [{ provider: 'google' }],
      },
    });
    const err = Object.assign(new Error('Invalid login credentials'), { code: 'invalid_grant' });
    mockSignInWithPassword.mockResolvedValueOnce({ error: err });

    render(<ChangePasswordScreen />);
    fillForm('anypass', 'newpass1', 'newpass1');

    await act(async () => {
      fireEvent.press(screen.getByText('Update Password'));
    });

    expect(screen.getByText(
      "Your account uses Google sign-in and does not have a password. Use 'Forgot password' to set one via email.",
    )).toBeTruthy();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('shows OAuth recovery message when error message contains "Invalid login credentials" and user is OAuth-only', async () => {
    mockUseAuthSession.mockReturnValue({
      user: {
        email: 'user@example.com',
        identities: [{ provider: 'google' }],
      },
    });
    mockSignInWithPassword.mockResolvedValueOnce({
      error: new Error('Invalid login credentials'),
    });

    render(<ChangePasswordScreen />);
    fillForm('anypass', 'newpass1', 'newpass1');

    await act(async () => {
      fireEvent.press(screen.getByText('Update Password'));
    });

    expect(screen.getByText(
      "Your account uses Google sign-in and does not have a password. Use 'Forgot password' to set one via email.",
    )).toBeTruthy();
  });

  it('shows generic incorrect-password error for credential error when user has an email identity', async () => {
    mockUseAuthSession.mockReturnValue({
      user: {
        email: 'user@example.com',
        identities: [{ provider: 'email' }, { provider: 'google' }],
      },
    });
    const err = Object.assign(new Error('Invalid login credentials'), { code: 'invalid_grant' });
    mockSignInWithPassword.mockResolvedValueOnce({ error: err });

    render(<ChangePasswordScreen />);
    fillForm('wrongpass', 'newpass1', 'newpass1');

    await act(async () => {
      fireEvent.press(screen.getByText('Update Password'));
    });

    expect(screen.getByText('Current password is incorrect.')).toBeTruthy();
  });

  it('shows generic incorrect-password error for unrelated auth error on OAuth-only user', async () => {
    mockUseAuthSession.mockReturnValue({
      user: {
        email: 'user@example.com',
        identities: [{ provider: 'google' }],
      },
    });
    mockSignInWithPassword.mockResolvedValueOnce({
      error: new Error('Too many requests'),
    });

    render(<ChangePasswordScreen />);
    fillForm('anypass', 'newpass1', 'newpass1');

    await act(async () => {
      fireEvent.press(screen.getByText('Update Password'));
    });

    expect(screen.getByText('Current password is incorrect.')).toBeTruthy();
  });

  it('shows incorrect password error when supabase auth fails', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: new Error('Invalid login') });

    render(<ChangePasswordScreen />);
    fillForm('wrongpass', 'newpass1', 'newpass1');

    await act(async () => {
      fireEvent.press(screen.getByText('Update Password'));
    });

    expect(screen.getByText('Current password is incorrect.')).toBeTruthy();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('signs out and shows security message when mutateAsync throws after successful re-auth', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('network error'));

    render(<ChangePasswordScreen />);
    fillForm('oldpass', 'newpass1', 'newpass1');

    await act(async () => {
      fireEvent.press(screen.getByText('Update Password'));
    });

    await waitFor(() => {
      expect(screen.getByText(
        'Something went wrong updating your password. You have been signed out for security. Please sign in and try again.',
      )).toBeTruthy();
    });
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('does not call signOut when signInWithPassword fails', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: new Error('wrong') });

    render(<ChangePasswordScreen />);
    fillForm('wrongpass', 'newpass1', 'newpass1');

    await act(async () => {
      fireEvent.press(screen.getByText('Update Password'));
    });

    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it('does not show success state after an API error', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('server error'));

    render(<ChangePasswordScreen />);
    fillForm('oldpass', 'newpass1', 'newpass1');

    await act(async () => {
      fireEvent.press(screen.getByText('Update Password'));
    });

    await waitFor(() => {
      expect(screen.queryByText('Password Updated')).toBeNull();
    });
  });

  // ── Navigation ──────────────────────────────────────────────────────────────

  it('calls router.back() when Done is pressed after success', async () => {
    render(<ChangePasswordScreen />);
    fillForm('oldpass', 'newpass1', 'newpass1');

    await act(async () => {
      fireEvent.press(screen.getByText('Update Password'));
    });

    await waitFor(() => screen.getByText('Done'));
    fireEvent.press(screen.getByText('Done'));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
