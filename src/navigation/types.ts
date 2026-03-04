export type ParentTab = 'home' | 'search' | 'explore' | 'saved' | 'profile';

export type ReviewTargetType = 'business' | 'event' | 'special';

export type OriginParam = {
  originTab?: ParentTab;
};

export type SharedEntityParams = {
  id: string;
} & OriginParam;

export type UsernameParams = {
  username: string;
} & OriginParam;

export type ReviewerParams = {
  id: string;
} & OriginParam;

export type WriteReviewParams = {
  type: ReviewTargetType;
  id: string;
};

export type DMThreadParams = {
  threadId: string;
};
