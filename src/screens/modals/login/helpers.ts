export function passwordScore(pw: string): number {
  if (pw.length === 0) return 0;
  if (pw.length < 6) return 1;
  if (pw.length < 8) return 2;
  if (pw.length < 12) return 3;
  return 4;
}

export function validateUsername(username: string): string {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 20) return "Username can't exceed 20 characters";
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Letters, numbers and underscores only';
  return '';
}

export function validateEmail(email: string): string {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email';
  return '';
}

export function getFriendlyAuthError(err: unknown): string {
  const msg = err instanceof Error ? err.message : '';
  if (msg.includes('Invalid login credentials')) return 'Incorrect email or password.';
  if (msg.includes('User already registered') || msg.includes('already been registered')) {
    return 'An account with this email already exists.';
  }
  if (msg.includes('Email rate limit exceeded') || msg.includes('rate limit')) {
    return 'Too many attempts. Please try again later.';
  }
  if (msg.includes('Email not confirmed')) return 'Please verify your email before signing in.';
  if (msg.includes('Password should be at least')) return 'Your password is too short.';
  if (msg.includes('Unable to validate email') || msg.includes('invalid format')) {
    return 'Please enter a valid email address.';
  }
  if (msg.includes('Network request failed') || msg.includes('fetch')) {
    return 'Connection error. Check your internet and try again.';
  }
  if (msg) return msg;
  return 'Something went wrong. Please try again.';
}
