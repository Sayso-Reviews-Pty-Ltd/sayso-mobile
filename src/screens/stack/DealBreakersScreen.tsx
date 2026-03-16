import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay,
  Easing, interpolate, makeMutable, type SharedValue,
} from 'react-native-reanimated';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { ONBOARDING_GRADIENTS, ONBOARDING_TOKENS } from '../../components/onboarding/onboardingTheme';
import { Text } from '../../components/Typography';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { apiFetch } from '../../lib/api';
import { routes } from '../../navigation/routes';

const MIN = 1;
const MAX = 3;

const DEALBREAKERS = [
  {
    id: 'trustworthiness',
    label: 'Trustworthiness',
    description: 'Reliable and honest service',
  },
  {
    id: 'punctuality',
    label: 'Punctuality',
    description: 'On-time and respects your schedule',
  },
  {
    id: 'friendliness',
    label: 'Friendliness',
    description: 'Welcoming and helpful staff',
  },
  {
    id: 'value-for-money',
    label: 'Value for Money',
    description: 'Fair pricing and good quality',
  },
] as const;

type DealbreakerId = typeof DEALBREAKERS[number]['id'];
type DealbreakerIconName = 'shield-checkmark-outline' | 'time-outline' | 'happy-outline' | 'pricetag-outline';
type PreferenceDto = { id: string };
type PreferencesResponseDto = { dealbreakers?: PreferenceDto[] };

type CardMutables = {
  opacity: SharedValue<number>;
  y: SharedValue<number>;
  selectedScale: SharedValue<number>;
  flip: SharedValue<number>;
};

const DEALBREAKER_ICONS: Record<DealbreakerId, DealbreakerIconName> = {
  trustworthiness: 'shield-checkmark-outline',
  punctuality: 'time-outline',
  friendliness: 'happy-outline',
  'value-for-money': 'pricetag-outline',
};

type DealBreakerCardProps = {
  item: typeof DEALBREAKERS[number];
  mutables: CardMutables;
  isSelected: boolean;
  isDisabled: boolean;
  onPress: () => void;
};

const DealBreakerCard = memo(function DealBreakerCard({
  item,
  mutables,
  isSelected,
  isDisabled,
  onPress,
}: DealBreakerCardProps) {
  const wrapStyle = useAnimatedStyle(() => ({
    width: '48.5%',
    opacity: mutables.opacity.value,
    transform: [
      { translateY: mutables.y.value },
      { scale: mutables.selectedScale.value },
    ],
  }), []);

  const frontFaceStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(mutables.flip.value, [0, 180], [0, 180])}deg` },
    ],
  }), []);

  const backFaceStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(mutables.flip.value, [0, 180], [180, 360])}deg` },
    ],
  }), []);

  return (
    <Animated.View style={wrapStyle}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          isDisabled && styles.cardDisabled,
          pressed && !isDisabled && styles.cardPressed,
        ]}
        onPress={onPress}
        disabled={isDisabled}
      >
        <View style={styles.flipCard}>
          <Animated.View style={[styles.cardFace, frontFaceStyle]}>
            <LinearGradient
              colors={
                isDisabled
                  ? ['rgba(45,45,45,0.05)', 'rgba(45,45,45,0.03)']
                  : ['rgba(157,171,155,0.10)', 'rgba(157,171,155,0.05)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.cardFaceFill, isDisabled && styles.cardFaceFillDisabled]}
            >
              <View style={[styles.cardIconWrap, isDisabled && styles.cardIconWrapDisabled]}>
                <Ionicons
                  name={DEALBREAKER_ICONS[item.id]}
                  size={24}
                  color={isDisabled ? 'rgba(45,45,45,0.45)' : ONBOARDING_TOKENS.sage}
                />
              </View>
              <Text style={styles.cardLabel}>{item.label}</Text>
              <Text numberOfLines={2} style={styles.cardDescription}>
                {item.description}
              </Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={[styles.cardFace, backFaceStyle]}>
            <LinearGradient
              colors={ONBOARDING_GRADIENTS.cardPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardFaceFill}
            >
              <View style={styles.selectedIconWrap}>
                <Ionicons name={DEALBREAKER_ICONS[item.id]} size={28} color={ONBOARDING_TOKENS.white} />
              </View>
              <View style={styles.selectedCheck}>
                <Ionicons name="checkmark-circle-outline" size={15} color={ONBOARDING_TOKENS.coral} />
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

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
          const valid = ids.filter((id): id is DealbreakerId => DEALBREAKERS.some((item) => item.id === id));
          if (!cancelled && valid.length > 0) {
            setSelected(new Set(valid));
            return;
          }
        }

        const preferences = await apiFetch<PreferencesResponseDto>('/api/user/preferences');
        const ids = (preferences.dealbreakers ?? [])
          .map((item) => item.id)
          .filter((id): id is DealbreakerId => DEALBREAKERS.some((dealbreaker) => dealbreaker.id === id));

        if (!cancelled && ids.length > 0) {
          setSelected(new Set(ids));
          await AsyncStorage.setItem('onboarding_dealbreakers', JSON.stringify(ids));
        }
      } catch {
        // Ignore hydration errors; screen remains usable.
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
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX) {
        next.add(id);
      }
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

  const handleBack = () => router.back();

  const helperText =
    selected.size === 0
      ? 'Select at least one deal-breaker to continue'
      : selected.size === MAX
        ? "Perfect! You've selected the maximum"
        : 'Great! Select more or complete setup';

  const badgeAnimStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ translateY: badgeY.value }],
  }), []);

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
        onBack={handleBack}
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
            {selected.size > 0 ? <Ionicons name="checkmark-circle-outline" size={15} color={ONBOARDING_TOKENS.sage} /> : null}
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
                isSelected={isSelected}
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

const styles = StyleSheet.create({
  errorBanner: {
    backgroundColor: 'rgba(229,224,229,0.95)',
    borderColor: 'rgba(114,47,55,0.35)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  errorText: {
    color: ONBOARDING_TOKENS.coral,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '600',
  },

  counterWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  counterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(157,171,155,0.2)',
    backgroundColor: 'rgba(157,171,155,0.10)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  counterPillReady: {
    borderColor: 'rgba(157,171,155,0.3)',
    backgroundColor: 'rgba(157,171,155,0.14)',
  },
  counterText: {
    color: ONBOARDING_TOKENS.sage,
    fontSize: 14,
    fontWeight: '600',
  },
  counterHint: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: ONBOARDING_TOKENS.charcoal60,
    fontWeight: '600',
    textAlign: 'center',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  card: {
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
  },
  flipCard: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  cardFace: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(157,171,155,0.30)',
  },
  cardFaceFill: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(157,171,155,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(157,171,155,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardIconWrapDisabled: {
    backgroundColor: 'rgba(45,45,45,0.08)',
    borderColor: 'rgba(45,45,45,0.16)',
  },
  cardFaceFillDisabled: {
    borderColor: 'rgba(45,45,45,0.2)',
  },
  cardDisabled: {
    opacity: 0.42,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  cardLabel: {
    textAlign: 'center',
    color: ONBOARDING_TOKENS.charcoal,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardDescription: {
    textAlign: 'center',
    color: ONBOARDING_TOKENS.charcoal60,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  selectedIconWrap: {
    width: 62,
    height: 62,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  selectedCheck: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: ONBOARDING_TOKENS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
