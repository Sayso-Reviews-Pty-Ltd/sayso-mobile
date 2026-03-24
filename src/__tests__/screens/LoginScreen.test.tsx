import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react-native';
import LoginScreen from '../../screens/modals/LoginScreen';
import { useAuthSession } from '../../hooks/useSession';
import { supabase } from '../../lib/supabase';

// navigator.onLine is checked by the login controller before calling
// signInWithPassword. Ensure it is true so the guard doesn't short-circuit.
Object.defineProperty(global.navigator, 'onLine', {
  get: () => true,
  configurable: true,
});

// ─── Module mocks ──────────────────────────────────────────────────────────────

const mockRouterPush = jest.fn();
const mockRouterReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: mockRouterReplace,
    back: jest.fn(),
  }),
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn(() => 'sayso://auth/callback'),
}));

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: any) =>
      React.createElement(View, props, children),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signOut: jest.fn().mockResolvedValue({}),
    },
  },
}));

jest.mock('../../hooks/useSession', () => ({
  useAuthSession: jest.fn(),
}));

jest.mock('../../lib/api', () => ({
  apiFetch: jest.fn().mockResolvedValue({ available: true }),
}));

jest.mock('../../navigation/routes', () => ({
  routes: {
    onboarding: () => '/onboarding',
    verifyEmail: () => '/verify-email',
    forgotPassword: () => '/forgot-password',
    terms: () => '/terms',
    privacy: () => '/privacy',
  },
}));

// ─── Typed mock helpers ────────────────────────────────────────────────────────

const mockSignInWithPassword = jest.fn();
const mockSignInWithGoogle = jest.fn();
const mockUseAuthSession = useAuthSession as jest.Mock;
const mockSignUp = (supabase.auth.signUp as jest.Mock);

function setupAuthMocks() {
  mockUseAuthSession.mockReturnValue({
    user: null,
    isLoading: false,
    signInWithPassword: mockSignInWithPassword,
    signInWithGoogle: mockSignInWithGoogle,
  });
}

function renderLogin(props?: { defaultMode?: 'login' | 'register' }) {
  return render(<LoginScreen {...props} />);
}

// ─── Login mode ────────────────────────────────────────────────────────────────

describe('LoginScreen — login mode (default)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthMocks();
  });

  // ── Rendering ────────────────────────────────────────────────────────────────

  it('renders the "Welcome Back" title', () => {
    renderLogin();
    expect(screen.getByText('Welcome Back')).toBeTruthy();
  });

  it('renders the login subtitle', () => {
    renderLogin();
    expect(screen.getByText('Sign in to continue discovering sayso.')).toBeTruthy();
  });

  it('renders email and password input fields', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('you@example.com')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter your password')).toBeTruthy();
  });

  it('renders the "Sign in" submit button', () => {
    renderLogin();
    expect(screen.getByText('Sign in')).toBeTruthy();
  });

  it('renders both Login and Register tab buttons', () => {
    renderLogin();
    expect(screen.getByText('Login')).toBeTruthy();
    expect(screen.getByText('Register')).toBeTruthy();
  });

  it('renders the "Forgot password?" link', () => {
    renderLogin();
    expect(screen.getByText('Forgot password?')).toBeTruthy();
  });

  it('renders the Google sign-in button', () => {
    renderLogin();
    expect(screen.getByText('Google')).toBeTruthy();
  });

  it('renders the switch-to-register prompt', () => {
    renderLogin();
    expect(screen.getByText("Don't have an account? ")).toBeTruthy();
  });

  it('does NOT render the username field in login mode', () => {
    renderLogin();
    expect(screen.queryByPlaceholderText('e.g. johndoe')).toBeNull();
  });

  // ── Email validation ─────────────────────────────────────────────────────────

  it('shows "Email is required" error when email field is blurred empty', () => {
    renderLogin();
    fireEvent(screen.getByPlaceholderText('you@example.com'), 'blur');
    expect(screen.getByText('Email is required')).toBeTruthy();
  });

  it('shows "Enter a valid email" error for malformed email', () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText('you@example.com');
    fireEvent.changeText(emailInput, 'not-an-email');
    fireEvent(emailInput, 'blur');
    expect(screen.getByText('Enter a valid email')).toBeTruthy();
  });

  it('clears email validation error when a valid email is entered', () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText('you@example.com');
    fireEvent.changeText(emailInput, 'bad');
    fireEvent(emailInput, 'blur');
    expect(screen.getByText('Enter a valid email')).toBeTruthy();

    fireEvent.changeText(emailInput, 'good@example.com');
    expect(screen.queryByText('Enter a valid email')).toBeNull();
  });

  // ── Form submission — login ──────────────────────────────────────────────────

  it('calls signInWithPassword with the entered email and password', async () => {
    mockSignInWithPassword.mockResolvedValueOnce(undefined);
    renderLogin();

    fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'user@test.com');
    fireEvent.changeText(screen.getByPlaceholderText('Enter your password'), 'secret123');

    await act(async () => {
      fireEvent.press(screen.getByText('Sign in'));
    });

    expect(mockSignInWithPassword).toHaveBeenCalledWith('user@test.com', 'secret123');
  });

  it('does not call signInWithPassword when email is empty', async () => {
    renderLogin();
    fireEvent.changeText(screen.getByPlaceholderText('Enter your password'), 'secret123');

    await act(async () => {
      fireEvent.press(screen.getByText('Sign in'));
    });

    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it('does not call signInWithPassword when password is empty', async () => {
    renderLogin();
    fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'user@test.com');

    await act(async () => {
      fireEvent.press(screen.getByText('Sign in'));
    });

    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it('shows "Verifying" while submission is in progress', async () => {
    mockSignInWithPassword.mockImplementation(() => new Promise(() => {})); // never resolves
    renderLogin();

    fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'user@test.com');
    fireEvent.changeText(screen.getByPlaceholderText('Enter your password'), 'secret123');

    act(() => {
      fireEvent.press(screen.getByText('Sign in'));
    });

    await waitFor(() => {
      expect(screen.getByText('Verifying')).toBeTruthy();
    });
  });

  it('prevents double submission — does not call signInWithPassword a second time while in progress', async () => {
    mockSignInWithPassword.mockImplementation(() => new Promise(() => {}));
    renderLogin();

    fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'user@test.com');
    fireEvent.changeText(screen.getByPlaceholderText('Enter your password'), 'secret123');

    act(() => { fireEvent.press(screen.getByText('Sign in')); });

    await waitFor(() => expect(screen.getByText('Verifying')).toBeTruthy());

    // Second press while submitting should be a no-op
    act(() => { fireEvent.press(screen.getByText('Verifying')); });
    expect(mockSignInWithPassword).toHaveBeenCalledTimes(1);
  });

  // ── Error handling ───────────────────────────────────────────────────────────

  it('shows the error banner when signInWithPassword throws an Error', async () => {
    mockSignInWithPassword.mockRejectedValueOnce(new Error('Invalid login credentials'));
    renderLogin();

    fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'user@test.com');
    fireEvent.changeText(screen.getByPlaceholderText('Enter your password'), 'wrongpass');

    await act(async () => {
      fireEvent.press(screen.getByText('Sign in'));
    });

    await waitFor(() => {
      expect(screen.getByText('Incorrect email or password.')).toBeTruthy();
    });
  });

  it('shows a generic error when the thrown value is not an Error instance', async () => {
    mockSignInWithPassword.mockRejectedValueOnce('non-error-string');
    renderLogin();

    fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'user@test.com');
    fireEvent.changeText(screen.getByPlaceholderText('Enter your password'), 'anypassword');

    await act(async () => {
      fireEvent.press(screen.getByText('Sign in'));
    });

    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please try again.')).toBeTruthy();
    });
  });

  it('restores the submit button after a failed login attempt', async () => {
    mockSignInWithPassword.mockRejectedValueOnce(new Error('Bad credentials'));
    renderLogin();

    fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'u@test.com');
    fireEvent.changeText(screen.getByPlaceholderText('Enter your password'), 'pass');

    await act(async () => {
      fireEvent.press(screen.getByText('Sign in'));
    });

    await waitFor(() => {
      // Button label reverts from "Verifying" back to "Sign in"
      expect(screen.getByText('Sign in')).toBeTruthy();
    });
  });

  // ── Navigation ───────────────────────────────────────────────────────────────

  it('navigates to forgot-password when the link is pressed', () => {
    renderLogin();
    fireEvent.press(screen.getByText('Forgot password?'));
    expect(mockRouterPush).toHaveBeenCalledWith('/forgot-password');
  });

  it('navigates back to onboarding when the back button is pressed', () => {
    renderLogin();
    // Back button wraps the chevron icon (mocked as Text with testID="icon-chevron-back-outline")
    fireEvent.press(screen.getByTestId('icon-chevron-back-outline'));
    expect(mockRouterReplace).toHaveBeenCalledWith('/onboarding');
  });

  // ── Google sign-in ───────────────────────────────────────────────────────────

  it('calls signInWithGoogle when the Google button is pressed', async () => {
    mockSignInWithGoogle.mockResolvedValueOnce(undefined);
    renderLogin();

    await act(async () => {
      fireEvent.press(screen.getByText('Google'));
    });

    expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('shows an error banner when Google sign-in throws', async () => {
    mockSignInWithGoogle.mockRejectedValueOnce(new Error('Google sign-in failed.'));
    renderLogin();

    await act(async () => {
      fireEvent.press(screen.getByText('Google'));
    });

    await waitFor(() => {
      expect(screen.getByText('Google sign-in failed.')).toBeTruthy();
    });
  });

  it('shows "Connecting…" while Google sign-in is in progress', async () => {
    mockSignInWithGoogle.mockImplementation(() => new Promise(() => {}));
    renderLogin();

    act(() => {
      fireEvent.press(screen.getByText('Google'));
    });

    await waitFor(() => {
      expect(screen.getByText('Connecting…')).toBeTruthy();
    });
  });
});

// ─── Register mode ─────────────────────────────────────────────────────────────

describe('LoginScreen — register mode (defaultMode="register")', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthMocks();
  });

  // ── Rendering ────────────────────────────────────────────────────────────────

  it('renders the "Create Your Account" title', () => {
    renderLogin({ defaultMode: 'register' });
    expect(screen.getByText('Create Your Account')).toBeTruthy();
  });

  it('renders the register subtitle', () => {
    renderLogin({ defaultMode: 'register' });
    expect(
      screen.getByText('Sign up today to share honest reviews and discover trusted businesses.')
    ).toBeTruthy();
  });

  it('renders username, email, and password fields', () => {
    renderLogin({ defaultMode: 'register' });
    expect(screen.getByPlaceholderText('e.g. johndoe')).toBeTruthy();
    expect(screen.getByPlaceholderText('you@example.com')).toBeTruthy();
    expect(screen.getByPlaceholderText('Create a password')).toBeTruthy();
  });

  it('renders the "Create account" submit button', () => {
    renderLogin({ defaultMode: 'register' });
    expect(screen.getByText('Create account')).toBeTruthy();
  });

  it('does NOT render the "Forgot password?" link', () => {
    renderLogin({ defaultMode: 'register' });
    expect(screen.queryByText('Forgot password?')).toBeNull();
  });

  it('renders the switch-to-login prompt', () => {
    renderLogin({ defaultMode: 'register' });
    expect(screen.getByText('Already have an account? ')).toBeTruthy();
  });

  // ── Username validation ──────────────────────────────────────────────────────

  it('shows "Username is required" when username is blurred empty', () => {
    renderLogin({ defaultMode: 'register' });
    fireEvent(screen.getByPlaceholderText('e.g. johndoe'), 'blur');
    expect(screen.getByText('Username is required')).toBeTruthy();
  });

  it('shows "At least 3 characters" for short username', () => {
    renderLogin({ defaultMode: 'register' });
    const input = screen.getByPlaceholderText('e.g. johndoe');
    fireEvent.changeText(input, 'ab');
    fireEvent(input, 'blur');
    expect(screen.getByText('Username must be at least 3 characters')).toBeTruthy();
  });

  it('shows "Max 20 characters" for username exceeding limit', () => {
    renderLogin({ defaultMode: 'register' });
    const input = screen.getByPlaceholderText('e.g. johndoe');
    fireEvent.changeText(input, 'a'.repeat(21));
    fireEvent(input, 'blur');
    expect(screen.getByText("Username can't exceed 20 characters")).toBeTruthy();
  });

  it('shows "Letters, numbers and underscores only" for invalid characters', () => {
    renderLogin({ defaultMode: 'register' });
    const input = screen.getByPlaceholderText('e.g. johndoe');
    fireEvent.changeText(input, 'bad user!');
    fireEvent(input, 'blur');
    expect(screen.getByText('Letters, numbers and underscores only')).toBeTruthy();
  });

  // ── Password strength ────────────────────────────────────────────────────────

  it('shows password strength bars when password has content', () => {
    renderLogin({ defaultMode: 'register' });
    fireEvent.changeText(screen.getByPlaceholderText('Create a password'), 'short');
    expect(screen.getByText('Needs more characters')).toBeTruthy();
  });

  it('shows "Good" strength label for a 6-7 character password', () => {
    // passwordScore: length >= 6 && < 8 → score 2 → STRENGTH_LABELS[2] = 'Good'
    renderLogin({ defaultMode: 'register' });
    fireEvent.changeText(screen.getByPlaceholderText('Create a password'), 'Ab1!23');
    expect(screen.getByText('Good')).toBeTruthy();
  });

  it('shows "Strong" label for an 8-11 character password', () => {
    // passwordScore: length >= 8 && < 12 → score 3 → STRENGTH_LABELS[3] = 'Strong'
    renderLogin({ defaultMode: 'register' });
    fireEvent.changeText(screen.getByPlaceholderText('Create a password'), 'StrongP@s');
    expect(screen.getByText('Strong')).toBeTruthy();
  });

  it('shows "Very strong" label for a 12+ character password', () => {
    renderLogin({ defaultMode: 'register' });
    fireEvent.changeText(screen.getByPlaceholderText('Create a password'), 'VeryStr0ngP@ss');
    expect(screen.getByText('Very strong')).toBeTruthy();
  });

  // ── Registration — error handling ────────────────────────────────────────────

  it('submit is blocked until consent is given (form is invalid without it)', () => {
    // Consent checkbox is a Pressable; pressing the consent text fires its onPress.
    renderLogin({ defaultMode: 'register' });

    fireEvent.changeText(screen.getByPlaceholderText('e.g. johndoe'), 'johndoe');
    fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'john@test.com');
    fireEvent.changeText(screen.getByPlaceholderText('Create a password'), 'StrongPass123');

    // Without toggling consent the form is still invalid — submit must not fire
    act(() => { fireEvent.press(screen.getByText('Create account')); });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('shows "Updating…" while registration is in progress', async () => {
    jest.useFakeTimers();
    mockSignUp.mockImplementation(() => new Promise(() => {}));
    renderLogin({ defaultMode: 'register' });

    fireEvent.changeText(screen.getByPlaceholderText('e.g. johndoe'), 'johndoe');
    fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'john@test.com');
    fireEvent.changeText(screen.getByPlaceholderText('Create a password'), 'StrongPass123');
    fireEvent.press(screen.getByTestId('consent-toggle'));

    // Flush the 300ms username debounce and the resulting apiFetch promise
    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    act(() => { fireEvent.press(screen.getByText('Create account')); });

    await waitFor(() => {
      expect(screen.getByText('Updating…')).toBeTruthy();
    });
    expect(mockSignUp).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('passes emailRedirectTo when creating an account', async () => {
    jest.useFakeTimers();
    mockSignUp.mockResolvedValueOnce({ error: null });
    renderLogin({ defaultMode: 'register' });

    fireEvent.changeText(screen.getByPlaceholderText('e.g. johndoe'), 'johndoe');
    fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'john@test.com');
    fireEvent.changeText(screen.getByPlaceholderText('Create a password'), 'StrongPass123');
    fireEvent.press(screen.getByTestId('consent-toggle'));

    // Flush the 300ms username debounce and the resulting apiFetch promise
    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    await act(async () => {
      fireEvent.press(screen.getByText('Create account'));
    });

    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'john@test.com',
        password: 'StrongPass123',
        options: expect.objectContaining({
          emailRedirectTo: 'sayso://auth/callback',
        }),
      })
    );
    jest.useRealTimers();
  });

  it('shows an error banner when supabase.auth.signUp returns an error', async () => {
    jest.useFakeTimers();
    mockSignUp.mockResolvedValueOnce({ error: new Error('Email address already in use') });
    renderLogin({ defaultMode: 'register' });

    fireEvent.changeText(screen.getByPlaceholderText('e.g. johndoe'), 'johndoe');
    fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'taken@test.com');
    fireEvent.changeText(screen.getByPlaceholderText('Create a password'), 'StrongPass123');
    fireEvent.press(screen.getByTestId('consent-toggle'));

    // Flush the 300ms username debounce and the resulting apiFetch promise
    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    await act(async () => {
      fireEvent.press(screen.getByText('Create account'));
    });

    await waitFor(() => {
      expect(screen.getByText('Email address already in use')).toBeTruthy();
    });
    jest.useRealTimers();
  });
});
