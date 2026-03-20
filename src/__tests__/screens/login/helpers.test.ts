import { getFriendlyAuthError } from '../../../screens/modals/login/helpers';

describe('getFriendlyAuthError', () => {
  it('keeps existing friendly mappings unchanged', () => {
    expect(getFriendlyAuthError(new Error('Invalid login credentials'))).toBe('Incorrect email or password.');
    expect(getFriendlyAuthError(new Error('User already registered'))).toBe('An account with this email already exists.');
    expect(getFriendlyAuthError(new Error('already been registered'))).toBe('An account with this email already exists.');
    expect(getFriendlyAuthError(new Error('Email rate limit exceeded'))).toBe('Too many attempts. Please try again later.');
    expect(getFriendlyAuthError(new Error('rate limit'))).toBe('Too many attempts. Please try again later.');
    expect(getFriendlyAuthError(new Error('Email not confirmed'))).toBe('Please verify your email before signing in.');
    expect(getFriendlyAuthError(new Error('Password should be at least 6 characters'))).toBe('Your password is too short.');
    expect(getFriendlyAuthError(new Error('Unable to validate email'))).toBe('Please enter a valid email address.');
    expect(getFriendlyAuthError(new Error('Network request failed'))).toBe('Connection error. Check your internet and try again.');
    expect(getFriendlyAuthError(new Error('fetch'))).toBe('Connection error. Check your internet and try again.');
    expect(getFriendlyAuthError('')).toBe('Something went wrong. Please try again.');
  });

  it('maps invalid format email errors to the specific friendly text', () => {
    expect(getFriendlyAuthError(new Error('Unable to validate email address: invalid format'))).toBe(
      "That doesn't look like a valid email address."
    );
  });
});
