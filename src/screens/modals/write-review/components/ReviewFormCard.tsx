import { ActivityIndicator, Animated, Image, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, TextInput } from '../../../../components/Typography';
import { CARD_GRADIENT } from '../../../../components/business-detail/styles';
import { AnimatedTip } from './AnimatedTip';
import { Divider } from './Divider';
import { RatingSelector } from './RatingSelector';
import { TagSelector } from './TagSelector';
import { C } from '../constants';
import { styles } from './reviewFormCardStyles';
import type { ReviewFormCardProps } from './ReviewFormCard.types';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export function ReviewFormCard({
  user,
  isEditMode,
  displayTitle,
  existingReviewLoading,
  controlsDisabled,
  formOpacity,
  formTranslateY,
  sectionAnims,
  rating,
  onRatingChange,
  effectiveQuickTags,
  selectedTags,
  onTagToggle,
  reviewTitle,
  onReviewTitleChange,
  onTitleFocus,
  onTitleBlur,
  titleScale,
  maxTitleChars,
  reviewText,
  onReviewTextChange,
  onTextFocus,
  onTextBlur,
  textFocused,
  bodyScale,
  charCount,
  maxChars,
  showValidation,
  minCharsRemaining,
  validationOpacity,
  validationTranslateY,
  progressAnim,
  reducedMotion,
  promptIndex,
  selectedImages,
  thumbScales,
  onPreviewImage,
  onRemoveImage,
  onAddPhoto,
  maxPhotos,
  formError,
  isFormValid,
  isSubmitDisabled,
  submitting,
  onSubmit,
}: ReviewFormCardProps) {
  return (
    <AnimatedLinearGradient colors={CARD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.formCard, { opacity: formOpacity, transform: [{ translateY: formTranslateY }] }]}>
      {!user ? (
        <View style={styles.anonNotice}>
          <Text style={styles.anonTitle}>Posting as Anonymous</Text>
          <Text style={styles.anonBody}>Sign in to tie this review to your profile identity.</Text>
        </View>
      ) : null}

      <View style={styles.formHeader}>
        <Ionicons name="create-outline" size={20} color={C.coral} />
        <View style={styles.formHeaderText}>
          <Text style={styles.formHeaderTitle}>{isEditMode ? 'Edit Review' : 'Write a Review'}</Text>
          {displayTitle ? (
            <Text style={styles.formHeaderSub}>
              {isEditMode ? `Update your experience with ${displayTitle}` : `Share your experience with ${displayTitle}`}
            </Text>
          ) : null}
        </View>
      </View>
      {existingReviewLoading ? <Text style={styles.prefillLabel}>Loading your existing review...</Text> : null}

      <Animated.View style={[styles.section, { opacity: sectionAnims[0].opacity, transform: [{ translateX: sectionAnims[0].translateX }] }]}>
        <RatingSelector value={rating} onChange={onRatingChange} disabled={controlsDisabled} />
      </Animated.View>

      <Divider />

      <Animated.View style={[styles.section, { opacity: sectionAnims[1].opacity, transform: [{ translateX: sectionAnims[1].translateX }] }]}>
        <TagSelector tags={effectiveQuickTags} selected={selectedTags} onToggle={onTagToggle} disabled={controlsDisabled} />
      </Animated.View>

      <Divider />

      <Animated.View style={[styles.section, { opacity: sectionAnims[2].opacity, transform: [{ translateX: sectionAnims[2].translateX }] }]}>
        <View style={styles.fieldHeaderRow}>
          <View style={styles.fieldHeader}>
            <Ionicons name="text-outline" size={16} color={C.charcoal60} />
            <Text style={styles.fieldLabel}>
              Title <Text style={styles.fieldOptional}>(optional)</Text>
            </Text>
          </View>
        </View>
        <Animated.View style={{ transform: [{ scale: titleScale }] }}>
          <TextInput
            style={styles.titleInput}
            value={reviewTitle}
            onChangeText={onReviewTitleChange}
            onFocus={onTitleFocus}
            onBlur={onTitleBlur}
            placeholder="Summarize your experience..."
            placeholderTextColor={C.charcoal30}
            maxLength={maxTitleChars}
            editable={!controlsDisabled}
          />
        </Animated.View>
        <Text style={styles.charCount}>{reviewTitle.length}/{maxTitleChars}</Text>
      </Animated.View>

      <Animated.View style={[styles.section, { opacity: sectionAnims[3].opacity, transform: [{ translateX: sectionAnims[3].translateX }] }]}>
        <View style={styles.fieldHeaderRow}>
          <View style={styles.fieldHeader}>
            <Ionicons name="chatbubble-outline" size={16} color={C.charcoal60} />
            <Text style={styles.fieldLabel}>Your review</Text>
          </View>
          <Text style={[styles.charCount, charCount > 4500 && styles.charCountWarn]}>{charCount}/{maxChars}</Text>
        </View>
        <Animated.View style={[{ position: 'relative' }, { transform: [{ scale: bodyScale }] }]}>
          <TextInput
            style={styles.bodyInput}
            value={reviewText}
            onChangeText={onReviewTextChange}
            onFocus={onTextFocus}
            onBlur={onTextBlur}
            placeholder="Share your experience with others..."
            placeholderTextColor={C.charcoal30}
            multiline
            textAlignVertical="top"
            maxLength={maxChars}
            editable={!controlsDisabled}
          />
          {reviewText.length === 0 && !textFocused ? <AnimatedTip promptIndex={promptIndex} reducedMotion={reducedMotion} /> : null}
        </Animated.View>
        {showValidation ? (
          <Animated.View style={{ opacity: validationOpacity, transform: [{ translateY: validationTranslateY }] }}>
            <Text style={styles.minCharsHint}>
              {minCharsRemaining} more character{minCharsRemaining !== 1 ? 's' : ''} needed
            </Text>
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
              </View>
            </View>
          </Animated.View>
        ) : null}
      </Animated.View>

      {!isEditMode ? <Divider /> : null}

      {!isEditMode ? (
        <Animated.View style={[styles.section, { opacity: sectionAnims[4].opacity, transform: [{ translateX: sectionAnims[4].translateX }] }]}>
          <View style={styles.fieldHeaderRow}>
            <View style={styles.fieldHeader}>
              <Ionicons name="camera-outline" size={16} color={C.charcoal60} />
              <Text style={styles.fieldLabel}>
                Photos <Text style={styles.fieldOptional}>(optional)</Text>
              </Text>
            </View>
            {selectedImages.length > 0 ? <Text style={styles.charCount}>{selectedImages.length}/{maxPhotos}</Text> : null}
          </View>
          {selectedImages.length > 0 ? (
            <View style={styles.photosRow}>
              {selectedImages.map((img, i) => (
                <Animated.View key={i} style={[styles.photoThumb, { transform: [{ scale: thumbScales[i] }] }]}>
                  <Pressable
                    style={styles.photoImg}
                    onPressIn={() => Animated.spring(thumbScales[i], { toValue: 0.88, useNativeDriver: true, speed: 40, bounciness: 6 }).start()}
                    onPressOut={() => Animated.spring(thumbScales[i], { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start()}
                    onPress={() => onPreviewImage(img.uri)}
                    disabled={controlsDisabled}
                  >
                    <Image source={{ uri: img.uri }} style={styles.photoImg} />
                  </Pressable>
                  <Pressable style={styles.photoRemoveBtn} onPress={() => onRemoveImage(i)} disabled={controlsDisabled}>
                    <Ionicons name="close-outline" size={11} color={C.white} />
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          ) : null}
          {selectedImages.length < maxPhotos ? (
            <Pressable style={styles.photoPickerZone} onPress={onAddPhoto} disabled={controlsDisabled}>
              <View style={styles.photoPickerIcon}>
                <Ionicons name="image-outline" size={22} color={C.charcoal60} />
              </View>
              <Text style={styles.photoPickerLabel}>Tap to add photos</Text>
              <Text style={styles.photoPickerSub}>
                {selectedImages.length > 0 ? `${selectedImages.length}/${maxPhotos} added` : `Up to ${maxPhotos} images, max 2MB each`}
              </Text>
            </Pressable>
          ) : null}
        </Animated.View>
      ) : null}

      {formError ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={18} color={C.coral} />
          <Text style={styles.errorText}>{formError}</Text>
        </View>
      ) : null}

      <Animated.View style={[styles.submitWrap, { opacity: sectionAnims[5].opacity, transform: [{ translateY: sectionAnims[5].translateX }] }]}>
        <Pressable
          testID="submit-review-btn"
          onPress={onSubmit}
          disabled={isSubmitDisabled}
          accessibilityState={{ disabled: isSubmitDisabled, busy: submitting }}
          style={{ width: '100%' }}
        >
          {submitting ? (
            <LinearGradient
              colors={[C.coral, 'rgba(114,47,55,0.90)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.submitBtn, styles.submitBtnBusy]}
            >
              <ActivityIndicator size="small" color={C.white} />
              <Text style={styles.submitText}>{isEditMode ? 'Saving...' : 'Submitting...'}</Text>
            </LinearGradient>
          ) : isFormValid ? (
            <LinearGradient colors={[C.coral, 'rgba(114,47,55,0.90)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitBtn}>
              <Text style={styles.submitText}>{isEditMode ? 'Save Changes' : 'Submit Review'}</Text>
              <Ionicons name="send-outline" size={16} color={C.white} />
            </LinearGradient>
          ) : (
            <View style={[styles.submitBtn, styles.submitBtnDisabled]}>
              <Text style={[styles.submitText, styles.submitTextDisabled]}>{isEditMode ? 'Save Changes' : 'Submit Review'}</Text>
            </View>
          )}
        </Pressable>
        {!isFormValid && !submitting ? (
          <Text style={styles.invalidHint}>
            {isEditMode ? 'Add a rating and at least 10 characters to save' : 'Add a rating and at least 10 characters to submit'}
          </Text>
        ) : null}
      </Animated.View>
    </AnimatedLinearGradient>
  );
}
