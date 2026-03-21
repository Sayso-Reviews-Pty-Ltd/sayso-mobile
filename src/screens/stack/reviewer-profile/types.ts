export interface ReviewerReview {
  id: string;
  businessId: string;
  businessName: string;
  businessImageUrl?: string | null;
  businessType: string;
  rating: number;
  text: string;
  date: string;
  likes: number;
  tags: string[];
}

export interface ReviewerBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedDate: string;
  badge_group?: string;
}

export interface ReviewerProfile {
  id: string;
  name: string;
  profilePicture: string;
  reviewCount: number;
  rating: number;
  badge?: 'top' | 'verified' | 'local';
  trophyBadge?: 'gold' | 'silver' | 'bronze' | 'rising-star' | 'community-favorite';
  location: string;
  memberSince: string;
  helpfulVotes: number;
  badgesCount: number;
  impactScore: number;
  averageRating: number;
  reviews: ReviewerReview[];
  badges: ReviewerBadge[];
}

export interface ApiResponse {
  reviewer: ReviewerProfile;
}
