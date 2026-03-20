import { C } from './constants';

export function passwordScore(password: string): number {
  if (password.length === 0) return 0;
  if (password.length < 6) return 1;
  if (password.length < 8) return 2;
  if (password.length < 12) return 3;
  return 4;
}

export function getPasswordStrengthLabel(score: number): string {
  if (score === 1) return 'Too short';
  if (score === 2) return 'Good';
  if (score === 3) return 'Strong';
  return 'Very strong';
}

export function getStrengthColor(score: number): string {
  return score >= 3 ? C.sage : C.amber;
}
