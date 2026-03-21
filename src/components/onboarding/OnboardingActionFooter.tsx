import { ActivityIndicator, Animated, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../Typography';
import { ONBOARDING_GRADIENTS, ONBOARDING_TOKENS } from './onboardingTheme';
import { styles } from './onboardingLayoutStyles';

type Props = {
  step: number;
  totalSteps: number;
  continueLabel: string;
  loadingLabel: string;
  continueVariant: 'continue' | 'complete';
  canContinue: boolean;
  isLoading: boolean;
  onContinue: () => void;
  actionOpacity: Animated.Value;
  actionY: Animated.Value;
  activeDotScale: Animated.Value;
};

export function OnboardingActionFooter({
  step,
  totalSteps,
  continueLabel,
  loadingLabel,
  continueVariant,
  canContinue,
  isLoading,
  onContinue,
  actionOpacity,
  actionY,
  activeDotScale,
}: Props) {
  const isCompleteVariant = continueVariant === 'complete';

  return (
    <Animated.View style={[styles.actionWrap, { opacity: actionOpacity, transform: [{ translateY: actionY }] }]}>
      <Pressable
        style={({ pressed }) => [
          styles.continueBtn,
          !canContinue && styles.continueBtnDisabled,
          pressed && canContinue && styles.continueBtnPressed,
        ]}
        onPress={onContinue}
        disabled={!canContinue || isLoading}
      >
        <LinearGradient
          colors={isCompleteVariant ? ONBOARDING_GRADIENTS.actionSecondary : ONBOARDING_GRADIENTS.actionPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.continueBtnGradient}
        >
          {isLoading ? (
            <>
              <ActivityIndicator size="small" color={ONBOARDING_TOKENS.white} style={styles.loadingSpinner} />
              <Text style={styles.continueTxt}>{loadingLabel}</Text>
            </>
          ) : (
            <>
              <Text style={styles.continueTxt}>{continueLabel}</Text>
              <Ionicons name="arrow-forward-outline" size={17} color={ONBOARDING_TOKENS.white} style={{ marginLeft: 8 }} />
            </>
          )}
        </LinearGradient>
      </Pressable>

      <View style={styles.progressDots}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const dot = index + 1;
          const isActive = dot === step;
          const isCompleted = dot < step;
          return (
            <Animated.View key={dot} style={isActive ? { transform: [{ scale: activeDotScale }] } : undefined}>
              <View
                style={[
                  styles.progressDot,
                  isActive && styles.progressDotActive,
                  isCompleted && styles.progressDotComplete,
                ]}
              />
            </Animated.View>
          );
        })}
      </View>
      <Text style={styles.progressLabel}>Step {step} of {totalSteps}</Text>
    </Animated.View>
  );
}
