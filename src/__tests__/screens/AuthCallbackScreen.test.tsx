import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AuthCallbackScreen from '../../screens/AuthCallbackScreen';
import { supabase } from '../../lib/supabase';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  Stack: { Screen: () => null },
}));

jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      exchangeCodeForSession: jest.fn(),
      getUser: jest.fn(),
      signOut: jest.fn().mockResolvedValue({}),
    },
    from: jest.fn(),
  },
}));

jest.mock('../../components/SkeletonBlock', () => ({
  SkeletonBlock: () => null,
}));

const mockUseRouter = useRouter as jest.Mock;
const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
const mockGetSession = (supabase.auth.getSession as jest.Mock);
const mockGetUser = (supabase.auth.getUser as jest.Mock);
const mockFrom = (supabase.from as jest.Mock);

function setupProfileReturn(data: {
  role?: string | null;
  account_role?: string | null;
  onboarding_step?: string | null;
  onboarding_completed_at?: string | null;
  onboarding_complete?: boolean | null;
} | null) {
  const single = jest.fn().mockResolvedValue({ data, error: null });
  const eq = jest.fn(() => ({ single }));
  const select = jest.fn(() => ({ eq }));
  mockFrom.mockReturnValue({ select });
}

describe('AuthCallbackScreen onboarding-aware signup routing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ replace: mockReplace, push: jest.fn(), back: jest.fn() });
    mockUseLocalSearchParams.mockReturnValue({ type: 'signup' });
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } }, error: null });
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
  });

  it('routes signup verification to /interests when onboarding step is empty', async () => {
    setupProfileReturn({
      role: 'user',
      account_role: 'user',
      onboarding_step: null,
      onboarding_completed_at: null,
      onboarding_complete: false,
    });

    render(<AuthCallbackScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/interests');
    });
  });

  it('routes signup verification to the saved onboarding step', async () => {
    setupProfileReturn({
      role: 'user',
      account_role: 'user',
      onboarding_step: 'subcategories',
      onboarding_completed_at: null,
      onboarding_complete: false,
    });

    render(<AuthCallbackScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/subcategories');
    });
  });

  it('routes signup verification to /home when onboarding is complete', async () => {
    setupProfileReturn({
      role: 'user',
      account_role: 'user',
      onboarding_step: 'complete',
      onboarding_completed_at: '2026-03-24T00:00:00.000Z',
      onboarding_complete: true,
    });

    render(<AuthCallbackScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/home');
    });
  });
});
