export type ExistingReviewDto = {
  id: string;
  rating?: number;
  title?: string | null;
  content?: string | null;
  body?: string | null;
  tags?: string[] | null;
};

export type CommunityReview = {
  id: string;
  userName: string;
  avatarUrl?: string | null;
  rating: number;
  text: string;
  date: string;
};

export type ConfettiPiece = {
  key: number;
  left: number;
  delay: number;
  duration: number;
  drift: number;
  size: number;
  rotate: number;
  color: string;
  shape: 'square' | 'circle' | 'rect';
};

export type FeedbackVariant = 'success' | 'warning' | 'error';

export type FeedbackNotice = {
  id: number;
  variant: FeedbackVariant;
  title: string;
  message: string;
};
