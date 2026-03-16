import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { NotificationItem } from '../../components/NotificationItem';

function makeNotification(overrides: Record<string, unknown> = {}) {
  return {
    id: 'notif-1',
    type: 'review',
    title: 'New review on your business',
    message: 'Someone left a 5-star review',
    created_at: '2026-03-16T11:58:00.000Z',
    read_at: null,
    ...overrides,
  } as any;
}

describe('NotificationItem', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-03-16T12:00:00.000Z').getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the notification title', () => {
    render(<NotificationItem notification={makeNotification()} />);
    expect(screen.getByText('New review on your business')).toBeTruthy();
  });

  it('renders the notification message', () => {
    render(<NotificationItem notification={makeNotification()} />);
    expect(screen.getByText('Someone left a 5-star review')).toBeTruthy();
  });

  it('renders a time string', () => {
    render(<NotificationItem notification={makeNotification()} />);
    expect(screen.getByText('2m ago')).toBeTruthy();
  });

  it('shows unread dot when read_at is null', () => {
    render(<NotificationItem notification={makeNotification({ read_at: null, read: undefined })} />);
    expect(screen.getByTestId('unread-dot')).toBeTruthy();
  });

  it('hides unread dot when read_at is set', () => {
    render(
      <NotificationItem
        notification={makeNotification({
          read: undefined,
          read_at: '2026-03-16T11:59:00.000Z',
        })}
      />
    );
    expect(screen.queryByTestId('unread-dot')).toBeNull();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<NotificationItem notification={makeNotification()} onPress={onPress} />);

    fireEvent.press(screen.getByText('New review on your business'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders correct icon for review type', () => {
    render(<NotificationItem notification={makeNotification({ type: 'review' })} />);
    expect(screen.getByTestId('icon-review')).toBeTruthy();
  });

  it('renders correct icon for dm type', () => {
    render(<NotificationItem notification={makeNotification({ type: 'dm' })} />);
    expect(screen.getByTestId('icon-dm')).toBeTruthy();
  });

  it('renders fallback icon for unknown type', () => {
    render(<NotificationItem notification={makeNotification({ type: 'unknown_type' })} />);
    expect(screen.getByTestId('icon-unknown_type')).toBeTruthy();
  });
});
