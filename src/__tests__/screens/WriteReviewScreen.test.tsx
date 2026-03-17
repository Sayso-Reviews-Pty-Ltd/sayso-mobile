import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';

// ─── Module mocks ─────────────────────────────────────────────────────────────

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
  Stack: { Screen: () => null },
}));

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: any) =>
      React.createElement(View, props, children),
  };
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }: any) =>
      React.createElement(View, props, children),
    useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
  };
});

jest.mock('../../lib/api', () => ({ apiFetch: jest.fn(), ApiError: class ApiError extends Error {} }));

jest.mock('../../lib/supabase', () => ({
  supabase: { auth: { getSession: jest.fn().mockResolvedValue({ data: { session: null } }) } },
}));

jest.mock('../../providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../providers/SecurityProvider', () => ({
  useSecurity: jest.fn(),
}));

jest.mock('../../hooks/useBusinessDetail', () => ({
  useBusinessDetail: jest.fn(),
}));

jest.mock('../../hooks/useEventSpecialDetail', () => ({
  useEventSpecialDetail: jest.fn(),
}));

jest.mock('../../hooks/useGlobalScrollToTop', () => ({
  useGlobalScrollToTop: jest.fn(),
}));

jest.mock('../../hooks/useRealtimeQueryInvalidation', () => ({
  useRealtimeQueryInvalidation: jest.fn(),
}));

jest.mock('../../hooks/useReducedMotion', () => ({
  useReducedMotion: jest.fn().mockReturnValue(true),
}));

jest.mock('../../hooks/useSavedBusinesses', () => ({
  useSavedBusinesses: jest.fn().mockReturnValue({ data: null }),
}));

jest.mock('../../navigation/routes', () => ({
  routes: {
    onboarding: () => '/onboarding',
    forgotPassword: () => '/forgot-password',
  },
}));

jest.mock('../../components/StackPageHeader', () => ({
  StackPageHeader: () => null,
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  MediaTypeOptions: { Images: 'Images' },
}));

jest.mock('../../lib/compressImage', () => ({
  compressImageForUpload: jest.fn(),
}));

jest.mock('react-native-url-polyfill/auto', () => {});

jest.mock('@sayso/contracts', () => ({}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../providers/AuthProvider';
import { useSecurity } from '../../providers/SecurityProvider';
import { useBusinessDetail } from '../../hooks/useBusinessDetail';
import { useEventSpecialDetail } from '../../hooks/useEventSpecialDetail';

const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockUseAuth = useAuth as jest.Mock;
const mockUseSecurity = useSecurity as jest.Mock;
const mockUseBusinessDetail = useBusinessDetail as jest.Mock;
const mockUseEventSpecialDetail = useEventSpecialDetail as jest.Mock;
const mockApiFetch = apiFetch as unknown as jest.Mock;

const mockRouterBack = jest.fn();

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderScreen() {
  const qc = createTestQueryClient();
  // Lazy import to avoid issues with hoisted mocks
  const WriteReviewScreen = require('../../screens/modals/WriteReviewScreen').default;
  render(
    <QueryClientProvider client={qc}>
      <WriteReviewScreen />
    </QueryClientProvider>
  );
  return qc;
}

function setupDefaults() {
  mockUseLocalSearchParams.mockReturnValue({ id: 'biz-123', type: 'business' });
  mockUseRouter.mockReturnValue({ back: mockRouterBack, push: jest.fn(), replace: jest.fn() });
  mockUseAuth.mockReturnValue({ user: { id: 'user-1' }, session: null, isLoading: false });
  mockUseSecurity.mockReturnValue({
    guardSensitiveAction: jest.fn().mockReturnValue({ allowed: true }),
    isReady: true,
    pinning: null,
    integrity: null,
  });
  mockUseBusinessDetail.mockReturnValue({
    data: { id: 'biz-123', name: 'Cafe Luna', verified: false },
    isLoading: false,
    error: null,
  });
  mockUseEventSpecialDetail.mockReturnValue({ data: null, isLoading: false });
  // Default: deal-breakers + any other API calls return empty
  mockApiFetch.mockResolvedValue({ dealBreakers: [] });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('WriteReviewScreen — rendering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaults();
  });

  it('renders the "Write a Review" form heading', () => {
    renderScreen();
    expect(screen.getByText('Write a Review')).toBeTruthy();
  });

  it('renders "How was your experience?" rating prompt', () => {
    renderScreen();
    expect(screen.getByText('How was your experience?')).toBeTruthy();
  });

  it('renders the review body text input', () => {
    renderScreen();
    expect(screen.getByPlaceholderText('Share your experience with others...')).toBeTruthy();
  });

  it('renders the submit button', () => {
    renderScreen();
    expect(screen.getByTestId('submit-review-btn')).toBeTruthy();
  });

  it('shows the invalid-hint when form is empty', () => {
    renderScreen();
    expect(
      screen.getByText('Add a rating and at least 10 characters to submit')
    ).toBeTruthy();
  });

  it('shows "Tap a star to rate" prompt when no star is selected', () => {
    renderScreen();
    expect(screen.getByText('Tap a star to rate')).toBeTruthy();
  });

  it('renders 5 star buttons with correct accessibility labels', () => {
    renderScreen();
    for (let i = 1; i <= 5; i++) {
      expect(
        screen.getByLabelText(`Rate ${i} star${i !== 1 ? 's' : ''}`)
      ).toBeTruthy();
    }
  });
});

describe('WriteReviewScreen — star rating', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaults();
  });

  it('shows the rating label after pressing a star', async () => {
    renderScreen();
    const star4 = screen.getByLabelText('Rate 4 stars');
    fireEvent.press(star4);
    await waitFor(() => {
      expect(screen.getByText('Great')).toBeTruthy();
    });
  });

  it('shows "Excellent" label when 5 stars selected', async () => {
    renderScreen();
    fireEvent.press(screen.getByLabelText('Rate 5 stars'));
    await waitFor(() => {
      expect(screen.getByText('Excellent')).toBeTruthy();
    });
  });

  it('shows "Poor" label when 1 star selected', async () => {
    renderScreen();
    fireEvent.press(screen.getByLabelText('Rate 1 star'));
    await waitFor(() => {
      expect(screen.getByText('Poor')).toBeTruthy();
    });
  });
});

describe('WriteReviewScreen — text validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaults();
  });

  it('shows N-more-characters hint for short text (< 10 chars)', async () => {
    renderScreen();
    const bodyInput = screen.getByPlaceholderText('Share your experience with others...');
    fireEvent.changeText(bodyInput, 'Short');

    await waitFor(() => {
      expect(screen.getByText('5 more characters needed')).toBeTruthy();
    });
  });

  it('shows singular "1 more character needed"', async () => {
    renderScreen();
    const bodyInput = screen.getByPlaceholderText('Share your experience with others...');
    fireEvent.changeText(bodyInput, '123456789'); // 9 chars

    await waitFor(() => {
      expect(screen.getByText('1 more character needed')).toBeTruthy();
    });
  });

  it('does NOT show the character hint when text meets minimum', async () => {
    renderScreen();
    const bodyInput = screen.getByPlaceholderText('Share your experience with others...');
    fireEvent.changeText(bodyInput, 'A'.repeat(10));

    await waitFor(() => {
      expect(screen.queryByText(/more character/)).toBeNull();
    });
  });
});

describe('WriteReviewScreen — form submission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaults();
  });

  async function fillValidForm() {
    renderScreen();
    // Select rating
    fireEvent.press(screen.getByLabelText('Rate 4 stars'));
    // Type sufficient review text
    fireEvent.changeText(
      screen.getByPlaceholderText('Share your experience with others...'),
      'This is a great cafe!'
    );
    await waitFor(() => {
      expect(screen.queryByText('Add a rating and at least 10 characters to submit')).toBeNull();
    });
  }

  it('disables the submit button while API call is in flight', async () => {
    // Allow deal-breakers to resolve; only hang the submit call
    mockApiFetch.mockImplementation((url: string, opts: any) => {
      if (url === '/api/deal-breakers') return Promise.resolve({ dealBreakers: [] });
      if (opts?.method === 'POST') return new Promise(() => {}); // hang
      return Promise.resolve({});
    });

    await fillValidForm();

    // Button should be enabled (not disabled) before pressing
    expect(screen.getByTestId('submit-review-btn').props.accessibilityState?.disabled).toBe(false);

    fireEvent.press(screen.getByTestId('submit-review-btn'));

    // After pressing, `submitting=true` → `isFormValid=false` → button is disabled
    await waitFor(() => {
      expect(screen.getByTestId('submit-review-btn').props.accessibilityState?.disabled).toBe(true);
    });
  });

  it('calls POST /api/reviews on valid submission', async () => {
    mockApiFetch.mockResolvedValueOnce({ success: true }); // deal-breakers pre-call
    mockApiFetch.mockResolvedValueOnce({ success: true }); // actual submit

    await fillValidForm();

    await act(async () => {
      fireEvent.press(screen.getByTestId('submit-review-btn'));
    });

    await waitFor(() => {
      const calls = mockApiFetch.mock.calls;
      const submitCall = calls.find(
        ([path, opts]: [string, any]) => path === '/api/reviews' && opts?.method === 'POST'
      );
      expect(submitCall).toBeDefined();
    });
  });

  it('shows form error when API returns success: false', async () => {
    mockApiFetch.mockImplementation((url: string, opts: any) => {
      if (url === '/api/deal-breakers') return Promise.resolve({ dealBreakers: [] });
      if (opts?.method === 'POST') return Promise.resolve({ success: false, message: 'You have already reviewed this business.' });
      return Promise.resolve({});
    });

    await fillValidForm();

    await act(async () => {
      fireEvent.press(screen.getByTestId('submit-review-btn'));
    });

    await waitFor(() => {
      expect(
        screen.getByText('You have already reviewed this business.')
      ).toBeTruthy();
    });
  });

  it('does not submit when form is invalid (no rating)', async () => {
    mockApiFetch.mockResolvedValue({ dealBreakers: [] });
    renderScreen();

    // Only fill text, no rating
    fireEvent.changeText(
      screen.getByPlaceholderText('Share your experience with others...'),
      'Good experience here!'
    );

    fireEvent.press(screen.getByTestId('submit-review-btn'));

    // apiFetch should NOT have been called with POST /api/reviews
    const reviewSubmitCall = mockApiFetch.mock.calls.find(
      ([path, opts]: [string, any]) => path === '/api/reviews' && opts?.method === 'POST'
    );
    expect(reviewSubmitCall).toBeUndefined();
  });

  it('shows security gate error when action is blocked', async () => {
    mockUseSecurity.mockReturnValue({
      guardSensitiveAction: jest.fn().mockReturnValue({
        allowed: false,
        reason: 'Device integrity check failed.',
      }),
      isReady: true,
      pinning: null,
      integrity: null,
    });
    mockApiFetch.mockResolvedValue({ dealBreakers: [] });

    await fillValidForm();

    await act(async () => {
      fireEvent.press(screen.getByTestId('submit-review-btn'));
    });

    await waitFor(() => {
      expect(screen.getByText('Device integrity check failed.')).toBeTruthy();
    });
  });
});

describe('WriteReviewScreen — edit mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({
      id: 'biz-123',
      type: 'business',
      reviewId: 'rev-456',
    });
    mockUseRouter.mockReturnValue({ back: mockRouterBack, push: jest.fn(), replace: jest.fn() });
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' }, session: null, isLoading: false });
    mockUseSecurity.mockReturnValue({
      guardSensitiveAction: jest.fn().mockReturnValue({ allowed: true }),
      isReady: true,
      pinning: null,
      integrity: null,
    });
    mockUseBusinessDetail.mockReturnValue({
      data: { id: 'biz-123', name: 'Cafe Luna', verified: false },
      isLoading: false,
      error: null,
    });
    mockUseEventSpecialDetail.mockReturnValue({ data: null, isLoading: false });
    // review-detail query + deal-breakers
    mockApiFetch.mockResolvedValue({ review: { id: 'rev-456', rating: 3, content: 'Old review text here.' } });
  });

  it('renders "Edit Review" heading in edit mode', () => {
    const qc = createTestQueryClient();
    const WriteReviewScreen = require('../../screens/modals/WriteReviewScreen').default;
    render(
      <QueryClientProvider client={qc}>
        <WriteReviewScreen />
      </QueryClientProvider>
    );
    expect(screen.getByText('Edit Review')).toBeTruthy();
  });

  it('shows "Save Changes" button in edit mode', async () => {
    const qc = createTestQueryClient();
    const WriteReviewScreen = require('../../screens/modals/WriteReviewScreen').default;
    render(
      <QueryClientProvider client={qc}>
        <WriteReviewScreen />
      </QueryClientProvider>
    );
    await waitFor(() => {
      expect(screen.getAllByText('Save Changes').length).toBeGreaterThan(0);
    });
  });
});
