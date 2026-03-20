import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ResetPasswordInvalidState } from '../../../screens/modals/reset-password/components/ResetPasswordInvalidState';

describe('ResetPasswordInvalidState', () => {
  it('keeps the default invalid-link messaging and actions unchanged', () => {
    const onRequestNewLink = jest.fn();
    const onBackToLogin = jest.fn();

    render(
      <ResetPasswordInvalidState
        invalidReason="invalid-link"
        message="ignored"
        onRequestNewLink={onRequestNewLink}
        onBackToLogin={onBackToLogin}
      />
    );

    expect(
      screen.getByText('Your password reset link may have expired or already been used. Request a fresh link to continue.')
    ).toBeTruthy();
    expect(screen.getByText('Request New Link')).toBeTruthy();
    expect(screen.getByText('Back to Login')).toBeTruthy();
    expect(screen.queryByText('Sign in')).toBeNull();
    expect(screen.queryByText('Resend reset link')).toBeNull();
  });

  it('shows the already-used copy with Sign in and Resend reset link actions', () => {
    const onRequestNewLink = jest.fn();
    const onBackToLogin = jest.fn();

    render(
      <ResetPasswordInvalidState
        invalidReason="already-used"
        message="This reset link has already been used. If you have already changed your password, sign in. If not, request a new link."
        onRequestNewLink={onRequestNewLink}
        onBackToLogin={onBackToLogin}
      />
    );

    expect(
      screen.getByText(
        'This reset link has already been used. If you have already changed your password, sign in. If not, request a new link.'
      )
    ).toBeTruthy();

    fireEvent.press(screen.getByText('Sign in'));
    expect(onBackToLogin).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByText('Resend reset link'));
    expect(onRequestNewLink).toHaveBeenCalledTimes(1);
  });
});
