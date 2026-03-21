import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { StackPageHeader } from '../../../components/StackPageHeader';
import { styles } from './screenStyles';
import { ContextSection } from './sections/ContextSection';
import { FeedbackSection } from './sections/FeedbackSection';
import { FooterSection } from './sections/FooterSection';
import { FormSection } from './sections/FormSection';
import { HeroSection } from './sections/HeroSection';
import { useWriteReviewController } from './useWriteReviewController';

export default function WriteReviewScreen() {
  const controller = useWriteReviewController();

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.safeAreaInner}>
        {!controller.isBusinessReview ? (
          <LinearGradient
            colors={['rgba(125,155,118,0.12)', controller.C.offWhite, 'rgba(114,47,55,0.06)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
        ) : null}

        <Stack.Screen
          options={{
            headerShown: true,
            headerShadowVisible: false,
            header: (props) => (
              <StackPageHeader
                {...props}
                onPressBack={controller.handleBack}
                rightActions={controller.headerRightActions}
              />
            ),
            headerStyle: { backgroundColor: controller.C.coral },
            headerTintColor: '#FFFFFF',
          }}
        />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            ref={controller.scrollRef}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onScroll={controller.handleScroll}
            scrollEventThrottle={16}
          >
            <HeroSection
              businessDetail={controller.businessDetail}
              businessName={controller.businessName}
              displayDate={controller.displayDate}
              displayImage={controller.displayImage}
              displayTitle={controller.displayTitle}
              displayValidUntil={controller.displayValidUntil}
              displayVenue={controller.displayVenue}
              heroImages={controller.heroImages}
              isBusinessReview={controller.isBusinessReview}
              isLoading={controller.isLoading}
            />

            <FormSection
              animations={controller.animations}
              charCount={controller.charCount}
              controlsDisabled={controller.controlsDisabled}
              displayTitle={controller.displayTitle}
              effectiveQuickTags={controller.effectiveQuickTags}
              existingReviewLoading={controller.existingReviewLoading}
              formError={controller.formError}
              handleAddPhoto={controller.handleAddPhoto}
              handleRemoveImage={controller.handleRemoveImage}
              handleSubmit={controller.handleSubmit}
              isEditMode={controller.isEditMode}
              isFormValid={controller.isFormValid}
              isSubmitDisabled={controller.isSubmitDisabled}
              maxChars={controller.MAX_CHARS}
              maxPhotos={controller.MAX_PHOTOS}
              maxTitleChars={controller.MAX_TITLE_CHARS}
              minChars={controller.MIN_CHARS}
              onRatingChange={controller.onRatingChange}
              onReviewTextChange={controller.onReviewTextChange}
              onReviewTitleChange={controller.onReviewTitleChange}
              onTagToggle={controller.handleTagToggle}
              onTextBlur={() => controller.setTextFocused(false)}
              onTextFocus={() => controller.setTextFocused(true)}
              onTitleBlur={() => controller.setTitleFocused(false)}
              onTitleFocus={() => controller.setTitleFocused(true)}
              promptIndex={controller.promptIndex}
              rating={controller.rating}
              reducedMotion={controller.reducedMotion}
              reviewText={controller.reviewText}
              reviewTitle={controller.reviewTitle}
              selectedImages={controller.selectedImages}
              selectedTags={controller.selectedTags}
              setPreviewUri={controller.setPreviewUri}
              showValidation={controller.showValidation}
              submitting={controller.submitting}
              textFocused={controller.textFocused}
              user={controller.user}
            />

            <ContextSection
              businessName={controller.businessName}
              communityReviews={controller.communityReviews}
              communityReviewsLoading={controller.communityReviewsLoading}
              displayDate={controller.displayDate}
              displayImage={controller.displayImage}
              displayTitle={controller.displayTitle}
              displayValidUntil={controller.displayValidUntil}
              displayVenue={controller.displayVenue}
              isBusinessReview={controller.isBusinessReview}
              isLoading={controller.isLoading}
              type={controller.type}
            />
          </ScrollView>
        </KeyboardAvoidingView>

        <FeedbackSection
          notificationNotice={controller.notificationNotice}
          showSuccessConfetti={controller.showSuccessConfetti}
          toastNotice={controller.toastNotice}
        />
      </View>

      <FooterSection
        previewUri={controller.previewUri}
        showShareMoment={controller.showShareMoment}
        onClosePreview={() => controller.setPreviewUri(null)}
        onCloseShareMoment={() => controller.setShowShareMoment(false)}
      />
    </SafeAreaView>
  );
}
