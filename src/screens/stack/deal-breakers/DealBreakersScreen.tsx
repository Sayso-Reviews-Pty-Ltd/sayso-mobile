import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  makeMutable,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingLayout } from '../../../components/onboarding/OnboardingLayout';
import { ONBOARDING_TOKENS } from '../../../components/onboarding/onboardingTheme';
import { Text } from '../../../components/Typography';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { apiFetch } from '../../../lib/api';
import { routes } from '../../../navigation/routes';
import { DealBreakerCard } from './DealBreakerCard';
import {
  DEALBREAKERS,
  MAX,
  MIN,
  type CardMutables,
  type DealbreakerId,
  type PreferencesResponseDto,
} from './constants';
import { styles } from './styles';

export default function DealBreakersScreen() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [selected, setSelected] = useState<Set<DealbreakerId>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const badgeOpacity = useSharedValue(0);
  const badgeY = useSharedValue(12);
  const prevSelectedRef = useRef<Set<DealbreakerId>>(new Set());
  const cardMutables = useRef<CardMutables[]>(
    DEALBREAKERS.map(() => ({
      opacity: makeMutable(0),
      y: makeMutable(20),
      selectedScale: makeMutable(1),
      flip: makeMutable(0),
    }))
  ).current;

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      try {
        const stored = await AsyncStorage.getItem('onboarding_dealbreakers');
        if (stored) {
          const ids = JSON.parse(stored) as string[];
          const valid = ids.filter((id): id is DealbreakerId =>
            DEALBREAKERS.some((item) => item.id === id)
          );
          if (!cancelled && valid.length > 0) {
            setSelected(new Set(valid));
            return;
          }
        }
        const preferences = await apiFetch<PreferencesResponseDto>('/api/user/preferences');
        const ids = (preferences.dealbreakers ?? [])
          .map((item) => item.id)
          .filter((id): id is DealbreakerId => DEALBREAKERS.some((d) => d.id === id));
        if (!cancelled && ids.length > 0) {
          setSelected(new Set(ids));
          await AsyncStorage.setItem('onboarding_dealbreakers', JSON.stringify(ids));
        }
      } catch {
        // Ignore hydration errors.
      }
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      badgeOpacity.value = 1;
      badgeY.value = 0;
      cardMutables.forEach((m) => {
        m.opacity.value = 1;
        m.y.value = 0;
      });
      return;
    }
    const ease = Easing.out(Easing.ease);
    badgeOpacity.value = withDelay(120, withTiming(1, { duration: 300, easing: ease }));
    badgeY.value = withDelay(120, withTiming(0, { duration: 300, easing: ease }));
    DEALBREAKERS.forEach((_, index) => {
      const delay = index * 100;
      const m = cardMutables[index];
      m.opacity.value = withDelay(delay, withTiming(1, { duration: 420, easing: ease }));
      m.y.value = withDelay(delay, withTiming(0, { duration: 420, easing: ease }));
    });
  }, [badgeOpacity, badgeY, cardMutables, reducedMotion]);

  useEffect(() => {
    const prevSelected = prevSelectedRef.current;
    DEALBREAKERS.forEach((item, index) => {
      const m = cardMutables[index];
      const wasSelected = prevSelected.has(item.id);
      const isSelected = selected.has(item.id);
      if (wasSelected === isSelected) return;
      if (reducedMotion) {
        m.selectedScale.value = isSelected ? 1.05 : 1;
        m.flip.value = isSelected ? 180 : 0;
        return;
      }
      m.selectedScale.value = withTiming(isSelected ? 1.05 : 1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
      m.flip.value = withTiming(isSelected ? 180 : 0, {
        duration: 600,
        easing: Easing.inOut(Easing.ease),
      });
    });
    prevSelectedRef.current = new Set(selected);
  }, [cardMutables, reducedMotion, selected]);

  const toggle = useCallback((id: DealbreakerId) => {
    try { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX) next.add(id);
      return next;
    });
  }, []);

  const canContinue = selected.size >= MIN;
  const atMax = selected.size >= MAX;

  const handleContinue = useCallback(async () => {
    if (!canContinue || isLoading) return;
    try { void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    setIsLoading(true);
    setError('');
    try {
      const ids = Array.from(selected);
      await apiFetch('/api/onboarding/deal-breakers', {
        method: 'POST',
        body: JSON.stringify({ dealbreakers: ids }),
      });
      await AsyncStorage.setItem('onboarding_dealbreakers', JSON.stringify(ids));
      router.replace(routes.completeProfile() as never);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save deal breakers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [canContinue, isLoading, router, selected]);

  const helperText =
    selected.size === 0
      ? 'Select at least one deal-breaker to continue'
      : selected.size === MAX
        ? "Perfect! You've selected the maximum"
        : 'Great! Select more or complete setup';

  const badgeAnimStyle = useAnimatedStyle(
    () => ({
      opacity: badgeOpacity.value,
      transform: [{ translateY: badgeY.value }],
    }),
    []
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <OnboardingLayout
        step={3}
        totalSteps={4}
        title="What are your dealbreakers?"
        subtitle="Select what matters most to you in a business"
        titleTyping
        titleTypingDelayMs={300}
        titleTypingSpeedMs={40}
        onBack={() => router.back()}
        onContinue={handleContinue}
        continueLabel="Complete Setup"
        continueVariant="complete"
        canContinue={canContinue}
        isLoading={isLoading}
      >
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Animated.View style={[styles.counterWrap, badgeAnimStyle]}>
          <View style={[styles.counterPill, selected.size > 0 && styles.counterPillReady]}>
            <Text style={styles.counterText}>
              {selected.size} of {MAX} selected
            </Text>
            {selected.size > 0 ? (
              <Ionicons name="checkmark-circle-outline" size={15} color={ONBOARDING_TOKENS.sage} />
            ) : null}
          </View>
          <Text style={styles.counterHint}>{helperText}</Text>
        </Animated.View>

        <View style={styles.grid}>
          {DEALBREAKERS.map((item, index) => {
            const isSelected = selected.has(item.id);
            const isDisabled = atMax && !isSelected;
            return (
              <DealBreakerCard
                key={item.id}
                item={item}
                mutables={cardMutables[index]}
                isDisabled={isDisabled}
                onPress={() => toggle(item.id)}
              />
            );
          })}
        </View>
      </OnboardingLayout>
    </>
  );
}
