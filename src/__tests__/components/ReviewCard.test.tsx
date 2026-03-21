import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ReviewCard, type ReviewCardData } from '../../components/review-card/ReviewCard';
import { useAuth } from '../../providers/AuthProvider';
import { useReviewHelpful } from '../../hooks/useReviewHelpful';

jest.mock('../../providers/AuthProvider', () => ({
  useAuth: jest.fn(() => ({ user: { id: 'user-1' } })),
}));

jest.mock('../../hooks/useReviewHelpful', () => ({
  useReviewHelpful: jest.fn(() => ({
    count: 3,
    isHelpful: false,
    loading: false,
    toggle: jest.fn(),
  })),
}));

const mockUseAuth = useAuth as unknown as jest.Mock;
const mockUseReviewHelpful = useReviewHelpful as unknown as jest.Mock;

function makeReview(overrides: Partial<ReviewCardData> = {}): ReviewCardData {
  return {
    id: 'review-1',
    userId: 'user-1',
    rating: 4,
    title: 'Great place',
    content: 'Loved the service and atmosphere.',
    tags: ['Friendly', 'Clean'],
    helpfulCount: 3,
    createdAt: '2026-03-16T10:00:00.000Z',
    user: {
      id: 'user-1',
      name: 'Hilarion',
      avatarUrl: null,
    },
    images: [],
    ...overrides,
  };
}

describe('ReviewCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });
    mockUseReviewHelpful.mockReturnValue({
      count: 3,
      isHelpful: false,
      loading: false,
      toggle: jest.fn(),
    });
  });

  it('renders reviewer name', () => {
    render(<ReviewCard review={makeReview()} />);
    expect(screen.getByText('Hilarion')).toBeTruthy();
  });

  it('renders review content', () => {
    render(<ReviewCard review={makeReview()} />);
    expect(screen.getByText('Loved the service and atmosphere.')).toBeTruthy();
  });

  it('renders the correct number of filled stars', () => {
    render(<ReviewCard review={makeReview({ rating: 4 })} />);
    expect(screen.getAllByTestId('star-filled')).toHaveLength(4);
  });

  it('renders review title when provided', () => {
    render(<ReviewCard review={makeReview({ title: 'Fantastic' })} />);
    expect(screen.getByText('Fantastic')).toBeTruthy();
  });

  it('does not render title when absent', () => {
    render(<ReviewCard review={makeReview({ title: undefined })} />);
    expect(screen.queryByText('Great place')).toBeNull();
  });

  it('renders tags when provided', () => {
    render(<ReviewCard review={makeReview({ tags: ['Friendly', 'Quick service'] })} />);
    expect(screen.getByText('Friendly')).toBeTruthy();
    expect(screen.getByText('Quick service')).toBeTruthy();
  });

  it('renders helpful count', () => {
    render(<ReviewCard review={makeReview({ helpfulCount: 3 })} />);
    expect(screen.getByText('Helpful (3)')).toBeTruthy();
  });

  it('calls toggle when helpful button is pressed', () => {
    const toggle = jest.fn();
    mockUseReviewHelpful.mockReturnValue({
      count: 3,
      isHelpful: false,
      loading: false,
      toggle,
    });

    render(<ReviewCard review={makeReview()} />);
    fireEvent.press(screen.getByLabelText('Mark as helpful'));
    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('shows Anonymous pill when userId is null', () => {
    render(
      <ReviewCard
        review={makeReview({
          userId: null,
          user: { id: null, name: 'Guest User', avatarUrl: null },
        })}
      />
    );

    expect(screen.getByText('Anonymous')).toBeTruthy();
  });

  it('shows verified checkmark when userId is set', () => {
    render(<ReviewCard review={makeReview({ userId: 'user-1' })} />);
    expect(screen.getByTestId('verified-checkmark')).toBeTruthy();
  });
});
