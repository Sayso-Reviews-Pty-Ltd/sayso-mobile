import { Dimensions } from 'react-native';
import { CARD_BG_COLOR, NAVBAR_BG_COLOR } from '../../../styles/colors';

export const MIN_CHARS = 10;
export const MAX_CHARS = 5000;
export const MAX_TITLE_CHARS = 100;
export const MAX_PHOTOS = 2;

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const HERO_WIDTH = SCREEN_WIDTH - 16;
export const HERO_HEIGHT = Math.round(SCREEN_HEIGHT * 0.50);

export const CONFETTI_PARTICLE_COUNT = 240;
export const CONFETTI_FALL_DISTANCE = Math.max(SCREEN_HEIGHT * 1.1, 700);

export const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

export const WRITING_PROMPTS = [
  'What did you enjoy most?',
  'How was the service?',
  'Would you recommend this place?',
  'Any tips for others?',
];

export const FALLBACK_TAGS = ['Trustworthy', 'On Time', 'Friendly', 'Good Value'];

export const REVIEW_ERROR_MESSAGES: Record<string, string> = {
  NOT_AUTHENTICATED: 'You can post as Anonymous, or sign in for a verified profile review.',
  EMAIL_NOT_VERIFIED: 'Please verify your email to submit reviews.',
  MISSING_FIELDS: 'Please fill in all required fields.',
  INVALID_RATING: 'Please select a rating (1–5 stars).',
  CONTENT_TOO_SHORT: 'Your review is too short. Please write at least 10 characters.',
  CONTENT_TOO_LONG: 'Your review is too long. Please keep it under 5000 characters.',
  TITLE_TOO_LONG: 'Review title is too long. Please keep it under 100 characters.',
  VALIDATION_FAILED: 'Please check your review and try again.',
  CONTENT_MODERATION_FAILED: "Your review contains content that doesn't meet our guidelines.",
  BUSINESS_NOT_FOUND: "We couldn't find that business. Please try again.",
  EVENT_NOT_FOUND: "We couldn't find that event. It may have been removed.",
  SPECIAL_NOT_FOUND: "We couldn't find that special. It may have expired.",
  DUPLICATE_REVIEW: "You've already reviewed this. You can edit your existing review instead.",
  DUPLICATE_ANON_REVIEW: 'You already posted an anonymous review for this item on this device.',
  RATE_LIMITED: 'Too many anonymous reviews in a short time. Please try again later.',
  SPAM_DETECTED: 'This review was flagged as spam-like. Please adjust wording and try again.',
  RLS_BLOCKED: "We couldn't save your review right now. Please try again.",
  DB_ERROR: "We couldn't save your review. Please try again.",
  IMAGE_UPLOAD_FAILED: "Some images couldn't be uploaded. Your review was saved.",
  SERVER_MISCONFIG: 'Server configuration issue. Please contact support.',
  SERVER_ERROR: 'Something went wrong on our side. Please try again.',
};

export const GENERIC_API_MESSAGES = new Set([
  'Request failed',
  'The request could not be processed. Please try again.',
  'Unauthorized',
  'Your session has expired. Please sign in again.',
  'You are not allowed to perform this action.',
  'The requested resource was not found.',
  'Too many requests. Please wait and try again.',
  'Server error. Please try again in a moment.',
  'Network request failed. Check your connection and try again.',
]);

export const C = {
  offWhite: '#E5E0E5',
  charcoal: '#2D2D2D',
  charcoal60: 'rgba(45,45,45,0.60)',
  charcoal45: 'rgba(45,45,45,0.45)',
  charcoal30: 'rgba(45,45,45,0.30)',
  charcoal10: 'rgba(45,45,45,0.10)',
  coral: NAVBAR_BG_COLOR,
  sage: CARD_BG_COLOR,
  white: '#FFFFFF',
  amber: '#D4915C',
  sageBorder: 'rgba(125,155,118,0.10)',
  cardBg: CARD_BG_COLOR,
  errorBg: 'rgba(114,47,55,0.08)',
  errorBorder: 'rgba(114,47,55,0.25)',
};

export const STAR_GRADIENT = ['#F7D060', '#E8A030'] as const;

export const CONFETTI_COLORS = [
  '#722F37',
  '#9DAB9B',
  '#FFD166',
  '#FF8C69',
  '#B5E48C',
  '#E5E0E5',
  '#F7D060',
  '#E8A030',
  '#FFF0A0',
];
