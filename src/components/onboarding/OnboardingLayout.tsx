import type { ReactNode } from 'react';
import { Animated, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useOnboardingAnimations } from './useOnboardingAnimations';
import { useTypingTitle } from './useTypingTitle';
import { OnboardingProgressBar } from './OnboardingProgressBar';
import { OnboardingBackButton } from './OnboardingBackButton';
import { OnboardingHeader } from './OnboardingHeader';
import { OnboardingActionFooter } from './OnboardingActionFooter';
import { styles } from './onboardingLayoutStyles';

type Props = {
  step: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  overlay?: ReactNode;
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
  loadingLabel?: string;
  continueVariant?: 'continue' | 'complete';
  canContinue: boolean;
  isLoading?: boolean;
  titleTyping?: boolean;
  titleTypingDelayMs?: number;
  titleTypingSpeedMs?: number;
  children: ReactNode;
};

export function OnboardingLayout({
  step,
  totalSteps,
  title,
  subtitle,
  overlay,
  onBack,
  onContinue,
  continueLabel = 'Continue',
  loadingLabel = 'Saving...',
  continueVariant = 'continue',
  canContinue,
  isLoading = false,
  titleTyping = false,
  titleTypingDelayMs = 300,
  titleTypingSpeedMs = 40,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const { width } = useWindowDimensions();

  const progressPercentage = Math.max(0, Math.min(100, (step / totalSteps) * 100));
  const hasBack = Boolean(onBack);

  const anims = useOnboardingAnimations(reducedMotion, step, hasBack);
  const displayTitle = useTypingTitle(title, titleTyping, titleTypingDelayMs, titleTypingSpeedMs, reducedMotion);

  const titleFontSize = width >= 1024 ? 36 : width >= 768 ? 30 : 24;
  const titleLineHeight = width >= 1024 ? 44 : width >= 768 ? 38 : 32;
  const subtitleFontSize = width >= 768 ? 16 : 14;
  const subtitleLineHeight = width >= 768 ? 24 : 21;

  return (
    <View style={styles.root}>
      {overlay}

      <OnboardingProgressBar
        progressPercentage={progressPercentage}
        progressScaleX={anims.progressScaleX}
      />

      {hasBack && onBack && (
        <OnboardingBackButton
          onBack={onBack}
          backOpacity={anims.backOpacity}
          backY={anims.backY}
          topInset={insets.top}
        />
      )}

      <Animated.ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 68, paddingBottom: insets.bottom + 22 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        decelerationRate="normal"
      >
        <View style={styles.mainContent}>
          <OnboardingHeader
            displayTitle={displayTitle}
            subtitle={subtitle}
            titleOpacity={anims.titleOpacity}
            titleY={anims.titleY}
            subtitleOpacity={anims.subtitleOpacity}
            subtitleY={anims.subtitleY}
            titleFontSize={titleFontSize}
            titleLineHeight={titleLineHeight}
            subtitleFontSize={subtitleFontSize}
            subtitleLineHeight={subtitleLineHeight}
          />

          {children}

          <OnboardingActionFooter
            step={step}
            totalSteps={totalSteps}
            continueLabel={continueLabel}
            loadingLabel={loadingLabel}
            continueVariant={continueVariant}
            canContinue={canContinue}
            isLoading={isLoading}
            onContinue={onContinue}
            actionOpacity={anims.actionOpacity}
            actionY={anims.actionY}
            activeDotScale={anims.activeDotScale}
          />
        </View>
      </Animated.ScrollView>
    </View>
  );
}
