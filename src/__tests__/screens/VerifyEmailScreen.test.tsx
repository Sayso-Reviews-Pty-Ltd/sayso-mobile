import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ExpoLinking from 'expo-linking';
import VerifyEmailScreen from '../../screens/modals/VerifyEmailScreen';
import { useProfile } from '../../providers/ProfileProvider';
import { supabase } from '../../lib/supabase';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn(() => 'sayso://auth/callback'),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

jest.mock('../../providers/ProfileProvider', () => ({
  useProfile: jest.fn(),
}));

jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      resend: jest.fn(),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      refreshSession: jest.fn().mockResolvedValue({}),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
        })),
      })),
    })),
  },
}));

const mockUseRouter = useRouter as jest.Mock;
const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
const mockUseProfile = useProfile as jest.Mock;
const mockAsyncStorage = AsyncStorage as unknown as { getItem: jest.Mock };
const mockCreateURL = ExpoLinking.createURL as jest.Mock;
const mockResend = (supabase.auth.resend as jest.Mock);

describe('VerifyEmailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ replace: mockReplace, push: jest.fn(), back: jest.fn() });
    mockUseLocalSearchParams.mockReturnValue({});
    mockUseProfile.mockReturnValue({ refreshProfile: jest.fn().mockResolvedValue(undefined) });
    mockAsyncStorage.getItem.mockResolvedValue('person@example.com');
    mockResend.mockResolvedValue({ error: null });
  });

  it('resends signup verification with app callback emailRedirectTo', async () => {
    render(<VerifyEmailScreen />);

    await screen.findByText('person@example.com');

    fireEvent.press(screen.getByText('Resend Verification Email'));

    await waitFor(() => {
      expect(mockResend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'person@example.com',
        options: {
          emailRedirectTo: 'sayso://auth/callback',
        },
      });
    });
    expect(mockCreateURL).toHaveBeenCalledWith('/auth/callback');
  });
});

