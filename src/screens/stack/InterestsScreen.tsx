import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
  withDelay, withSequence, Easing, makeMutable, type SharedValue,
} from 'react-native-reanimated';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { ONBOARDING_GRADIENTS, ONBOARDING_TOKENS } from '../../components/onboarding/onboardingTheme';
import { Text } from '../../components/Typography';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { apiFetch } from '../../lib/api';
import { haptics } from '../../lib/haptics';
import { routes } from '../../navigation/routes';

const MIN = 3;
const MAX = 6;

const INTERESTS = [
  { id: 'food-drink', label: 'Food & Drink' },
  { id: 'beauty-wellness', label: 'Beauty & Wellness' },
  { id: 'professional-services', label: 'Professional Services' },
  { id: 'travel', label: 'Travel' },
  { id: 'outdoors-adventure', label: 'Outdoors & Adventure' },
  { id: 'experiences-entertainment', label: 'Entertainment & Experiences' },
  { id: 'arts-culture', label: 'Arts & Culture' },
  { id: 'family-pets', label: 'Family & Pets' },
  { id: 'shopping-lifestyle', label: 'Shopping & Lifestyle' },
] as const;

type InterestId = typeof INTERESTS[number]['id'];
type InterestPreferenceDto = { id: string };
type PreferencesResponseDto = { interests?: InterestPreferenceDto[] };

type ItemMutables = {
  opacity: SharedValue<number>;
  y: SharedValue<number>;
  x: SharedValue<number>;
  entryScale: SharedValue<number>;
  selectedScale: SharedValue<number>;
  bounceScale: SharedValue<number>;
  checkScale: SharedValue<number>;
};

type InterestItemProps = {
  item: typeof INTERESTS[number];
  mutables: ItemMutables;
  isSelected: boolean;
  isDisabled: boolean;
  onPress: () => void;
};

const InterestItem = memo(function InterestItem({ item, mutables, isSelected, isDisabled, onPress }: InterestItemProps) {
  const wrapStyle = useAnimatedStyle(() => ({
    width: '48.2%',
    opacity: mutables.opacity.value,
    transform: [
      { translateY: mutables.y.value },
      { translateX: mutables.x.value },
      { scale: mutables.entryScale.value },
      { scale: mutables.selectedScale.value },
      { scale: mutables.bounceScale.value },
    ],
  }), []);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mutables.checkScale.value }],
    opacity: mutables.checkScale.value,
  }), []);

  return (
    <Animated.View style={wrapStyle}>
      <Pressable
        style={({ pressed }) => [
          styles.circle,
          isDisabled && styles.circleDisabled,
          pressed && !isDisabled && styles.circlePressed,
        ]}
        onPress={onPress}
        disabled={isDisabled}
      >
        <LinearGradient
          colors={isSelected ? ONBOARDING_GRADIENTS.cardPrimary : ONBOARDING_GRADIENTS.cardSecondary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.circleFill, isSelected && styles.circleFillSelected]}
        >
          <Text style={[styles.circleLabel, isSelected && styles.circleLabelSelected]}>
            {item.label}
          </Text>
        </LinearGradient>
      </Pressable>
      {isSelected ? (
        <Animated.View style={[styles.checkBadge, checkStyle]}>
          <Ionicons name="checkmark-circle-outline" size={22} color={ONBOARDING_TOKENS.sage} />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
});

export default function InterestsScreen() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [selected, setSelected] = useState<Set<InterestId>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const badgeOpacity = useSharedValue(0);
  const badgeY = useSharedValue(12);
  const prevSelectedRef = useRef<Set<InterestId>>(new Set());
  const itemMutables = useRef<ItemMutables[]>(
    INTERESTS.map(() => ({
      opacity: makeMutable(0),
      y: makeMutable(20),
      x: makeMutable(0),
      entryScale: makeMutable(0.9),
      selectedScale: makeMutable(1),
      bounceScale: makeMutable(1),
      checkScale: makeMutable(0),
    }))
  ).current;

  useEffect(() => {
    let cancelled = false;

    async function hydrateSelections() {
      try {
        const stored = await AsyncStorage.getItem('onboarding_interests');
        if (stored) {
          const ids = JSON.parse(stored) as string[];
          const valid = ids.filter((id): id is InterestId => INTERESTS.some((item) => item.id === id));
          if (!cancelled && valid.length > 0) {
            setSelected(new Set(valid));
            return;
          }
        }

        const preferences = await apiFetch<PreferencesResponseDto>('/api/user/preferences');
        const ids = (preferences.interests ?? [])
          .map((item) => item.id)
          .filter((id): id is InterestId => INTERESTS.some((interest) => interest.id === id));

        if (!cancelled && ids.length > 0) {
          setSelected(new Set(ids));
          await AsyncStorage.setItem('onboarding_interests', JSON.stringify(ids));
        }
      } catch {
        // Ignore hydration errors; screen remains usable with empty selections.
      }
    }

    hydrateSelections();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      badgeOpacity.value = 1;
      badgeY.value = 0;
      itemMutables.forEach((m) => {
        m.opacity.value = 1;
        m.y.value = 0;
        m.entryScale.value = 1;
      });
      return;
    }

    const ease = Easing.bezier(0.25, 0.8, 0.25, 1);
    badgeOpacity.value = withDelay(120, withTiming(1, { duration: 300, easing: ease }));
    badgeY.value = withDelay(120, withTiming(0, { duration: 300, easing: ease }));

    INTERESTS.forEach((_, i) => {
      const delay = Math.min(i, 8) * 30 + 100;
      const m = itemMutables[i];
      m.opacity.value = withDelay(delay, withTiming(1, { duration: 400, easing: ease }));
      m.y.value = withDelay(delay, withTiming(0, { duration: 400, easing: ease }));
      m.entryScale.value = withDelay(delay, withTiming(1, { duration: 400, easing: ease }));
    });
  }, [badgeOpacity, badgeY, itemMutables, reducedMotion]);

  useEffect(() => {
    const prevSelected = prevSelectedRef.current;
    INTERESTS.forEach((item, index) => {
      const m = itemMutables[index];
      const wasSelected = prevSelected.has(item.id);
      const isSelected = selected.has(item.id);
      if (wasSelected === isSelected) return;

      if (reducedMotion) {
        m.selectedScale.value = isSelected ? 1.05 : 1;
        m.checkScale.value = isSelected ? 1 : 0;
        return;
      }

      m.selectedScale.value = withSpring(isSelected ? 1.05 : 1, { stiffness: 400, damping: 17, mass: 1 });

      if (isSelected) {
        m.checkScale.value = 0;
        m.checkScale.value = withSpring(1, { stiffness: 500, damping: 25, mass: 1 });
      } else {
        m.checkScale.value = withTiming(0, { duration: 120, easing: Easing.out(Easing.ease) });
      }
    });
    prevSelectedRef.current = new Set(selected);
  }, [itemMutables, reducedMotion, selected]);

  const triggerShake = useCallback((id: InterestId) => {
    if (reducedMotion) return;
    const index = INTERESTS.findIndex((interest) => interest.id === id);
    if (index < 0) return;
    const m = itemMutables[index];
    m.x.value = 0;
    m.x.value = withSequence(
      withTiming(-4, { duration: 70, easing: Easing.inOut(Easing.ease) }),
      withTiming(4, { duration: 70, easing: Easing.inOut(Easing.ease) }),
      withTiming(-3, { duration: 70, easing: Easing.inOut(Easing.ease) }),
      withTiming(2, { duration: 70, easing: Easing.inOut(Easing.ease) }),
      withTiming(0, { duration: 70, easing: Easing.inOut(Easing.ease) })
    );
  }, [itemMutables, reducedMotion]);

  const toggle = useCallback((id: InterestId) => {
    haptics.navigation();
    const index = INTERESTS.findIndex((interest) => interest.id === id);
    if (index >= 0 && !reducedMotion) {
      const m = itemMutables[index];
      m.bounceScale.value = 1;
      m.bounceScale.value = withSequence(
        withTiming(1.08, { duration: 140, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 210, easing: Easing.out(Easing.ease) })
      );
    }

    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX) {
        next.add(id);
      } else {
        triggerShake(id);
      }
      return next;
    });
  }, [itemMutables, reducedMotion, triggerShake]);

  const canContinue = selected.size >= MIN && selected.size <= MAX;
  const atMax = selected.size >= MAX;

  const handleContinue = useCallback(async () => {
    if (!canContinue || isLoading) return;
    haptics.complete();
    setIsLoading(true);
    setError('');
    try {
      const ids = Array.from(selected);
      await apiFetch('/api/onboarding/interests', {
        method: 'POST',
        body: JSON.stringify({ interests: ids }),
      });
      await AsyncStorage.setItem('onboarding_interests', JSON.stringify(ids));
      router.push(routes.subcategories() as never);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save interests. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [canContinue, isLoading, router, selected]);

  const handleBack = () => router.replace(routes.register() as never);

  const helperText =
    selected.size < MIN
      ? `Select ${MIN - selected.size} or more to continue`
      : selected.size === MAX
        ? "Perfect! You've selected the maximum"
        : 'Great! You can continue or select more';

  const badgeAnimStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ translateY: badgeY.value }],
  }), []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <OnboardingLayout
        step={1}
        totalSteps={4}
        title="What interests you?"
        subtitle="Pick a few things you love and let's personalise your experience!"
        onBack={handleBack}
        onContinue={handleContinue}
        canContinue={canContinue}
        isLoading={isLoading}
      >
        <View style={styles.contentLayer}>
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Animated.View style={[styles.selectionWrap, badgeAnimStyle]}>
            <View style={[styles.selectionPill, selected.size >= MIN && styles.selectionPillReady]}>
              <Text style={styles.selectionPillText}>
                {selected.size} of {MIN}-{MAX} selected
              </Text>
              {selected.size >= MIN ? (
                <Ionicons name="checkmark-circle-outline" size={15} color={ONBOARDING_TOKENS.sage} />
              ) : null}
            </View>
            <Text style={styles.selectionHint}>{helperText}</Text>
          </Animated.View>

          <View style={styles.grid}>
            {INTERESTS.map((item, index) => {
              const isSelected = selected.has(item.id);
              const isDisabled = atMax && !isSelected;
              return (
                <InterestItem
                  key={item.id}
                  item={item}
                  mutables={itemMutables[index]}
                  isSelected={isSelected}
                  isDisabled={isDisabled}
                  onPress={() => toggle(item.id)}
                />
              );
            })}
          </View>
        </View>
      </OnboardingLayout>
    </>
  );
}

const styles = StyleSheet.create({
  contentLayer: {
    position: 'relative',
    zIndex: 1,
  },

  errorBanner: {
    backgroundColor: 'rgba(229,224,229,0.95)',
    borderColor: 'rgba(114,47,55,0.35)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  errorText: {
    color: ONBOARDING_TOKENS.coral,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '600',
  },

  selectionWrap: {
    alignItems: 'center',
    marginBottom: 18,
  },
  selectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(157,171,155,0.2)',
    backgroundColor: 'rgba(157,171,155,0.10)',
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  selectionPillReady: {
    borderColor: 'rgba(157,171,155,0.3)',
    backgroundColor: 'rgba(157,171,155,0.14)',
  },
  selectionPillText: {
    color: ONBOARDING_TOKENS.sage,
    fontSize: 14,
    fontWeight: '600',
  },
  selectionHint: {
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
    rowGap: 14,
  },
  circle: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circleFill: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    position: 'relative',
  },
  circleFillSelected: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  circleDisabled: {
    opacity: 0.42,
  },
  circlePressed: {
    transform: [{ scale: 0.95 }],
  },
  circleLabel: {
    color: ONBOARDING_TOKENS.white,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '600',
    textAlign: 'center',
  },
  circleLabelSelected: {
    color: ONBOARDING_TOKENS.white,
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});
