import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { EmptyState } from '../../components/EmptyState';
import { haptics } from '../../lib/haptics';

jest.mock('../../lib/haptics', () => ({
  haptics: { tap: jest.fn() },
}));

const mockTap = (haptics.tap as jest.Mock);

describe('EmptyState', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── Title ────────────────────────────────────────────────────────────────

  it('renders the title', () => {
    render(<EmptyState title="Nothing here yet" />);
    expect(screen.getByText('Nothing here yet')).toBeTruthy();
  });

  // ─── Message ──────────────────────────────────────────────────────────────

  it('renders the message when provided', () => {
    render(<EmptyState title="Title" message="Try adjusting your filters." />);
    expect(screen.getByText('Try adjusting your filters.')).toBeTruthy();
  });

  it('does not render a message element when omitted', () => {
    render(<EmptyState title="Title" />);
    expect(screen.queryByText('Try adjusting your filters.')).toBeNull();
  });

  // ─── Action button ────────────────────────────────────────────────────────

  it('renders the action button when both actionLabel and onAction are provided', () => {
    render(<EmptyState title="Title" actionLabel="Sign In" onAction={jest.fn()} />);
    expect(screen.getByText('Sign In')).toBeTruthy();
  });

  it('does not render a button when onAction is omitted', () => {
    render(<EmptyState title="Title" actionLabel="Sign In" />);
    expect(screen.queryByText('Sign In')).toBeNull();
  });

  it('does not render a button when actionLabel is omitted', () => {
    render(<EmptyState title="Title" onAction={jest.fn()} />);
    // Title still renders but there is no pressable button label
    expect(screen.getByText('Title')).toBeTruthy();
  });

  it('calls onAction when the button is pressed', () => {
    const onAction = jest.fn();
    render(<EmptyState title="Title" actionLabel="Go" onAction={onAction} />);
    fireEvent.press(screen.getByText('Go'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('calls haptics.tap() when the button is pressed', () => {
    render(<EmptyState title="Title" actionLabel="Go" onAction={jest.fn()} />);
    fireEvent.press(screen.getByText('Go'));
    expect(mockTap).toHaveBeenCalledTimes(1);
  });

  it('calls haptics.tap() before onAction', () => {
    const callOrder: string[] = [];
    const onAction = jest.fn(() => callOrder.push('onAction'));
    mockTap.mockImplementation(() => callOrder.push('haptics'));

    render(<EmptyState title="Title" actionLabel="Go" onAction={onAction} />);
    fireEvent.press(screen.getByText('Go'));

    expect(callOrder).toEqual(['haptics', 'onAction']);
  });

  // ─── Icon ─────────────────────────────────────────────────────────────────

  it('renders the default "search" icon', () => {
    render(<EmptyState title="Title" />);
    // Ionicons mock renders a Text with testID="icon-{name}"
    expect(screen.getByTestId('icon-search')).toBeTruthy();
  });

  it('renders a custom icon when provided', () => {
    render(<EmptyState title="Title" icon="heart-outline" />);
    expect(screen.getByTestId('icon-heart-outline')).toBeTruthy();
  });

  it('does not render an icon with the wrong name', () => {
    render(<EmptyState title="Title" icon="heart-outline" />);
    expect(screen.queryByTestId('icon-search')).toBeNull();
  });
});
