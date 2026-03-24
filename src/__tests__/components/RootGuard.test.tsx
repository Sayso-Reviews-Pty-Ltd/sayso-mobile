import React from 'react';
import { Text } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';
import { useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import { RootGuard } from '../../components/RootGuard';
import { useAuth } from '../../providers/AuthProvider';
import { useProfile } from '../../providers/ProfileProvider';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useGlobalSearchParams: jest.fn(() => ({})),
  useRootNavigationState: jest.fn(() => ({ key: 'root' })),
}));

jest.mock('../../providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../providers/ProfileProvider', () => ({
  useProfile: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;
const mockUsePathname = usePathname as jest.Mock;
const mockUseGlobalSearchParams = useGlobalSearchParams as jest.Mock;
const mockUseAuth = useAuth as jest.Mock;
const mockUseProfile = useProfile as jest.Mock;

const FULLY_ONBOARDED = {
  accountRole: 'user',
  role: 'user',
  isEmailVerified: true,
  isOnboardingComplete: true,
  onboardingStep: null,
};

function setup({
  session = null,
  isAuthLoading = false,
  profileState = null as object | null,
  isProfileLoading = false,
  pathname = '/home',
}: {
  session?: object | null;
  isAuthLoading?: boolean;
  profileState?: object | null;
  isProfileLoading?: boolean;
  pathname?: string;
} = {}) {
  const replace = jest.fn();
  mockUseRouter.mockReturnValue({ replace });
  mockUsePathname.mockReturnValue(pathname);
  mockUseGlobalSearchParams.mockReturnValue({});
  mockUseAuth.mockReturnValue({ session, isLoading: isAuthLoading });
  mockUseProfile.mockReturnValue({ profileState, isProfileLoading });
  render(<RootGuard><Text>child</Text></RootGuard>);
  return { replace };
}

describe('RootGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children', () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace });
    mockUsePathname.mockReturnValue('/home');
    mockUseGlobalSearchParams.mockReturnValue({});
    mockUseAuth.mockReturnValue({ session: null, isLoading: true });
    mockUseProfile.mockReturnValue({ profileState: null, isProfileLoading: true });
    const { getByText } = render(<RootGuard><Text>child content</Text></RootGuard>);
    expect(getByText('child content')).toBeTruthy();
  });

  it('does not redirect while auth is loading', async () => {
    const { replace } = setup({ isAuthLoading: true });
    await waitFor(() => {});
    expect(replace).not.toHaveBeenCalled();
  });

  it('does not redirect while profile is loading', async () => {
    const { replace } = setup({
      session: { user: { id: '1' } },
      isProfileLoading: true,
      pathname: '/home',
    });
    await waitFor(() => {});
    expect(replace).not.toHaveBeenCalled();
  });

  // ── Unauthenticated routing ────────────────────────────────────────────────

  it('redirects unauthenticated user to /onboarding from any non-onboarding route', async () => {
    const { replace } = setup({ session: null, pathname: '/for-you' });
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('does not redirect unauthenticated user already on /onboarding', async () => {
    const { replace } = setup({ session: null, pathname: '/onboarding' });
    await waitFor(() => {});
    expect(replace).not.toHaveBeenCalled();
  });

  it('redirects unauthenticated user trying to access /notifications', async () => {
    const { replace } = setup({ session: null, pathname: '/notifications' });
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/onboarding');
    });
  });

  // ── Authenticated initial routing ─────────────────────────────────────────

  it('redirects authenticated user on /login to /home on first load', async () => {
    const { replace } = setup({
      session: { user: { id: '1' } },
      profileState: FULLY_ONBOARDED,
      pathname: '/login',
    });
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/home');
    });
  });

  it('does not redirect authenticated fully-onboarded user already on /home', async () => {
    const { replace } = setup({
      session: { user: { id: '1' } },
      profileState: FULLY_ONBOARDED,
      pathname: '/home',
    });
    await waitFor(() => {});
    expect(replace).not.toHaveBeenCalled();
  });

  // ── Role enforcement ───────────────────────────────────────────────────────

  it('redirects business_owner to /role-unsupported', async () => {
    const { replace } = setup({
      session: { user: { id: '1' } },
      profileState: { ...FULLY_ONBOARDED, accountRole: 'business_owner' },
      pathname: '/home',
    });
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/role-unsupported');
    });
  });

  it('redirects admin to /role-unsupported', async () => {
    const { replace } = setup({
      session: { user: { id: '1' } },
      profileState: { ...FULLY_ONBOARDED, accountRole: 'admin' },
      pathname: '/home',
    });
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/role-unsupported');
    });
  });

  // ── Email verification ─────────────────────────────────────────────────────

  it('redirects unverified email user to /verify-email', async () => {
    const { replace } = setup({
      session: { user: { id: '1' } },
      profileState: { ...FULLY_ONBOARDED, isEmailVerified: false },
      pathname: '/home',
    });
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/verify-email');
    });
  });

  it('does not redirect unverified user already on /verify-email', async () => {
    const { replace } = setup({
      session: { user: { id: '1' } },
      profileState: { ...FULLY_ONBOARDED, isEmailVerified: false },
      pathname: '/verify-email',
    });
    await waitFor(() => {});
    expect(replace).not.toHaveBeenCalledWith('/verify-email');
  });

  // ── Onboarding enforcement ─────────────────────────────────────────────────

  it('redirects incomplete onboarding user to /interests when step is null', async () => {
    const { replace } = setup({
      session: { user: { id: '1' } },
      profileState: { ...FULLY_ONBOARDED, isOnboardingComplete: false, onboardingStep: null },
      pathname: '/home',
    });
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/interests');
    });
  });

  it('redirects incomplete onboarding user to /subcategories when on that step', async () => {
    const { replace } = setup({
      session: { user: { id: '1' } },
      profileState: { ...FULLY_ONBOARDED, isOnboardingComplete: false, onboardingStep: 'subcategories' },
      pathname: '/home',
    });
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/subcategories');
    });
  });

  it('redirects incomplete onboarding user to /deal-breakers when on that step', async () => {
    const { replace } = setup({
      session: { user: { id: '1' } },
      profileState: { ...FULLY_ONBOARDED, isOnboardingComplete: false, onboardingStep: 'deal-breakers' },
      pathname: '/home',
    });
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/deal-breakers');
    });
  });

  it('redirects authenticated incomplete-onboarding user to expected onboarding step', async () => {
    // Incomplete users are routed to their expected onboarding step, and cannot
    // deep-link ahead into later steps.
    const { replace } = setup({
      session: { user: { id: '1' } },
      profileState: { ...FULLY_ONBOARDED, isOnboardingComplete: false, onboardingStep: null },
      pathname: '/deal-breakers',
    });
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/interests');
    });
  });

  // ── Fully onboarded user off auth screens ─────────────────────────────────

  it('redirects fully-onboarded user off /register to /home', async () => {
    const { replace } = setup({
      session: { user: { id: '1' } },
      profileState: FULLY_ONBOARDED,
      pathname: '/register',
    });
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/home');
    });
  });

  it('keeps default redirect for fully-onboarded user on onboarding route without edit flag', async () => {
    const { replace } = setup({
      session: { user: { id: '1' } },
      profileState: FULLY_ONBOARDED,
      pathname: '/interests',
    });
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/home');
    });
  });

  it('allows fully-onboarded user on onboarding step route when edit=1 is present', async () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace });
    mockUsePathname.mockReturnValue('/interests');
    mockUseGlobalSearchParams.mockReturnValue({ edit: '1', returnTo: '/for-you' });
    mockUseAuth.mockReturnValue({ session: { user: { id: '1' } }, isLoading: false });
    mockUseProfile.mockReturnValue({ profileState: FULLY_ONBOARDED, isProfileLoading: false });

    render(<RootGuard><Text>child</Text></RootGuard>);
    await waitFor(() => {});

    expect(replace).not.toHaveBeenCalledWith('/home');
  });
});
