import { Animated } from 'react-native';

export type SectionAnim = {
  opacity: Animated.Value;
  translateX: Animated.Value;
};

export type SelectedImage = {
  uri: string;
  name: string;
  mimeType: string;
};

export type ReviewFormCardProps = {
  user: unknown;
  isEditMode: boolean;
  displayTitle: string;
  existingReviewLoading: boolean;
  controlsDisabled: boolean;
  formOpacity: Animated.Value;
  formTranslateY: Animated.Value;
  sectionAnims: SectionAnim[];
  rating: number;
  onRatingChange: (value: number) => void;
  effectiveQuickTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  reviewTitle: string;
  onReviewTitleChange: (value: string) => void;
  onTitleFocus: () => void;
  onTitleBlur: () => void;
  titleScale: Animated.Value;
  maxTitleChars: number;
  reviewText: string;
  onReviewTextChange: (value: string) => void;
  onTextFocus: () => void;
  onTextBlur: () => void;
  textFocused: boolean;
  bodyScale: Animated.Value;
  charCount: number;
  maxChars: number;
  showValidation: boolean;
  minCharsRemaining: number;
  validationOpacity: Animated.Value;
  validationTranslateY: Animated.Value;
  progressAnim: Animated.Value;
  reducedMotion: boolean;
  promptIndex: number;
  selectedImages: SelectedImage[];
  thumbScales: Animated.Value[];
  onPreviewImage: (uri: string) => void;
  onRemoveImage: (index: number) => void;
  onAddPhoto: () => void;
  maxPhotos: number;
  formError: string | null;
  isFormValid: boolean;
  isSubmitDisabled: boolean;
  submitting: boolean;
  onSubmit: () => void;
};
