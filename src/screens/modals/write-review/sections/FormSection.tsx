import { ReviewFormCard } from '../components';

type Props = {
  animations: any;
  charCount: number;
  controlsDisabled: boolean;
  effectiveQuickTags: string[];
  existingReviewLoading: boolean;
  formError: string | null;
  handleAddPhoto: () => void;
  handleRemoveImage: (index: number) => void;
  handleSubmit: () => Promise<void>;
  isEditMode: boolean;
  isFormValid: boolean;
  isSubmitDisabled: boolean;
  maxChars: number;
  maxPhotos: number;
  maxTitleChars: number;
  minChars: number;
  onRatingChange: (value: number) => void;
  onReviewTextChange: (value: string) => void;
  onReviewTitleChange: (value: string) => void;
  onTagToggle: (tag: string) => void;
  onTextBlur: () => void;
  onTextFocus: () => void;
  onTitleBlur: () => void;
  onTitleFocus: () => void;
  promptIndex: number;
  rating: number;
  reducedMotion: boolean;
  reviewText: string;
  reviewTitle: string;
  selectedImages: Array<{ uri: string; name: string; mimeType: string }>;
  selectedTags: string[];
  showValidation: boolean;
  submitting: boolean;
  textFocused: boolean;
  user: any;
  displayTitle: string;
  setPreviewUri: (uri: string | null) => void;
};

export function FormSection({
  animations,
  charCount,
  controlsDisabled,
  displayTitle,
  effectiveQuickTags,
  existingReviewLoading,
  formError,
  handleAddPhoto,
  handleRemoveImage,
  handleSubmit,
  isEditMode,
  isFormValid,
  isSubmitDisabled,
  maxChars,
  maxPhotos,
  maxTitleChars,
  minChars,
  onRatingChange,
  onReviewTextChange,
  onReviewTitleChange,
  onTagToggle,
  onTextBlur,
  onTextFocus,
  onTitleBlur,
  onTitleFocus,
  promptIndex,
  rating,
  reducedMotion,
  reviewText,
  reviewTitle,
  selectedImages,
  selectedTags,
  setPreviewUri,
  showValidation,
  submitting,
  textFocused,
  user,
}: Props) {
  return (
    <ReviewFormCard
      user={user}
      isEditMode={isEditMode}
      displayTitle={displayTitle}
      existingReviewLoading={existingReviewLoading}
      controlsDisabled={controlsDisabled}
      formOpacity={animations.formOpacity}
      formTranslateY={animations.formTranslateY}
      sectionAnims={animations.sectionAnims}
      rating={rating}
      onRatingChange={onRatingChange}
      effectiveQuickTags={effectiveQuickTags}
      selectedTags={selectedTags}
      onTagToggle={onTagToggle}
      reviewTitle={reviewTitle}
      onReviewTitleChange={onReviewTitleChange}
      onTitleFocus={onTitleFocus}
      onTitleBlur={onTitleBlur}
      titleScale={animations.titleScale}
      maxTitleChars={maxTitleChars}
      reviewText={reviewText}
      onReviewTextChange={onReviewTextChange}
      onTextFocus={onTextFocus}
      onTextBlur={onTextBlur}
      textFocused={textFocused}
      bodyScale={animations.bodyScale}
      charCount={charCount}
      maxChars={maxChars}
      showValidation={showValidation}
      minCharsRemaining={minChars - reviewText.trim().length}
      validationOpacity={animations.validationOpacity}
      validationTranslateY={animations.validationTranslateY}
      progressAnim={animations.progressAnim}
      reducedMotion={reducedMotion}
      promptIndex={promptIndex}
      selectedImages={selectedImages}
      thumbScales={animations.thumbScales}
      onPreviewImage={setPreviewUri}
      onRemoveImage={handleRemoveImage}
      onAddPhoto={handleAddPhoto}
      maxPhotos={maxPhotos}
      formError={formError}
      isFormValid={isFormValid}
      isSubmitDisabled={isSubmitDisabled}
      submitting={submitting}
      onSubmit={handleSubmit}
    />
  );
}
