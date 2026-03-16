import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
  withDelay, withSequence, Easing, makeMutable, type SharedValue,
} from 'react-native-reanimated';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { ONBOARDING_GRADIENTS, ONBOARDING_TOKENS } from '../../components/onboarding/onboardingTheme';
import { Text } from '../../components/Typography';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { apiFetch } from '../../lib/api';
import { routes } from '../../navigation/routes';

const MIN = 1;
const MAX = 10;

type Subcategory = { id: string; label: string };

const SUBCATEGORY_MAP: Record<string, { groupLabel: string; items: Subcategory[] }> = {
  'food-drink': {
    groupLabel: 'Food & Drink',
    items: [
      { id: 'restaurants', label: 'Restaurants' },
      { id: 'cafes', label: 'Cafés & Coffee' },
      { id: 'bars', label: 'Bars & Pubs' },
      { id: 'fast-food', label: 'Fast Food' },
      { id: 'fine-dining', label: 'Fine Dining' },
    ],
  },
  'beauty-wellness': {
    groupLabel: 'Beauty & Wellness',
    items: [
      { id: 'gyms', label: 'Gyms & Fitness' },
      { id: 'spas', label: 'Spas' },
      { id: 'salons', label: 'Hair Salons' },
      { id: 'wellness', label: 'Wellness Centers' },
      { id: 'nail-salons', label: 'Nail Salons' },
    ],
  },
  'professional-services': {
    groupLabel: 'Professional Services',
    items: [
      { id: 'education-learning', label: 'Education & Learning' },
      { id: 'transport-travel', label: 'Transport & Travel' },
      { id: 'finance-insurance', label: 'Finance & Insurance' },
      { id: 'plumbers', label: 'Plumbers' },
      { id: 'electricians', label: 'Electricians' },
      { id: 'legal-services', label: 'Legal Services' },
    ],
  },
  travel: {
    groupLabel: 'Travel',
    items: [
      { id: 'accommodation', label: 'Accommodation' },
      { id: 'transport', label: 'Transport' },
      { id: 'travel-services', label: 'Travel Services' },
    ],
  },
  'outdoors-adventure': {
    groupLabel: 'Outdoors & Adventure',
    items: [
      { id: 'hiking', label: 'Hiking' },
      { id: 'cycling', label: 'Cycling' },
      { id: 'water-sports', label: 'Water Sports' },
      { id: 'camping', label: 'Camping' },
    ],
  },
  'experiences-entertainment': {
    groupLabel: 'Entertainment & Experiences',
    items: [
      { id: 'events-festivals', label: 'Events & Festivals' },
      { id: 'sports-recreation', label: 'Sports & Recreation' },
      { id: 'nightlife', label: 'Nightlife' },
      { id: 'comedy-clubs', label: 'Comedy Clubs' },
      { id: 'cinemas', label: 'Cinemas' },
    ],
  },
  'arts-culture': {
    groupLabel: 'Arts & Culture',
    items: [
      { id: 'museums', label: 'Museums' },
      { id: 'galleries', label: 'Art Galleries' },
      { id: 'theaters', label: 'Theaters' },
      { id: 'concerts', label: 'Concerts' },
    ],
  },
  'family-pets': {
    groupLabel: 'Family & Pets',
    items: [
      { id: 'family-activities', label: 'Family Activities' },
      { id: 'pet-services', label: 'Pet Services' },
      { id: 'childcare', label: 'Childcare' },
      { id: 'veterinarians', label: 'Veterinarians' },
    ],
  },
  'shopping-lifestyle': {
    groupLabel: 'Shopping & Lifestyle',
    items: [
      { id: 'fashion', label: 'Fashion & Clothing' },
      { id: 'electronics', label: 'Electronics' },
      { id: 'home-decor', label: 'Home Decor' },
      { id: 'books', label: 'Books & Media' },
    ],
  },
};

const MAX_GROUPS = Object.keys(SUBCATEGORY_MAP).length;

type PreferenceDto = { id: string };
type PreferencesResponseDto = {
  interests?: PreferenceDto[];
  subcategories?: PreferenceDto[];
};

type GroupMutables = {
  opacity: SharedValue<number>;
  y: SharedValue<number>;
  titleX: SharedValue<number>;
};

type PillMutables = {
  opacity: SharedValue<number>;
  entryScale: SharedValue<number>;
  selectedScale: SharedValue<number>;
  x: SharedValue<number>;
  y: SharedValue<number>;
  tapScale: SharedValue<number>;
  checkScale: SharedValue<number>;
};

type PillItemProps = {
  item: { id: string; label: string };
  mutables: PillMutables;
  isSelected: boolean;
  isDisabled: boolean;
  onPress: () => void;
};

const PillItem = memo(function PillItem({ item, mutables, isSelected, isDisabled, onPress }: PillItemProps) {
  const wrapStyle = useAnimatedStyle(() => ({
    opacity: mutables.opacity.value,
    transform: [
      { translateX: mutables.x.value },
      { translateY: mutables.y.value },
      { scale: mutables.entryScale.value },
      { scale: mutables.selectedScale.value },
      { scale: mutables.tapScale.value },
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
          styles.pill,
          isDisabled && styles.pillDisabled,
          pressed && !isDisabled && styles.pillPressed,
        ]}
        onPress={onPress}
        disabled={isDisabled}
      >
        <LinearGradient
          colors={
            isSelected
              ? ONBOARDING_GRADIENTS.cardPrimary
              : ['rgba(157,171,155,0.10)', 'rgba(157,171,155,0.05)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.pillFill, isSelected && styles.pillSelected]}
        >
          <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>{item.label}</Text>
          {isSelected ? (
            <Animated.View style={checkStyle}>
              <Ionicons name="checkmark-circle-outline" size={14} color={ONBOARDING_TOKENS.white} />
            </Animated.View>
          ) : null}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
});

type GroupSectionProps = {
  group: { interestId: string; groupLabel: string; items: { id: string; label: string }[] };
  mutables: GroupMutables;
  getPillMutables: (id: string) => PillMutables;
  selected: Set<string>;
  atMax: boolean;
  onToggle: (id: string) => void;
};

const GroupSection = memo(function GroupSection({ group, mutables, getPillMutables, selected, atMax, onToggle }: GroupSectionProps) {
  const groupStyle = useAnimatedStyle(() => ({
    opacity: mutables.opacity.value,
    transform: [{ translateY: mutables.y.value }],
  }), []);

  const labelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: mutables.titleX.value }],
  }), []);

  return (
    <Animated.View style={[styles.group, groupStyle]}>
      <Animated.Text style={[styles.groupLabel, labelStyle]}>
        {group.groupLabel}
      </Animated.Text>
      <View style={styles.pillsRow}>
        {group.items.map((item) => {
          const isSelected = selected.has(item.id);
          const isDisabled = atMax && !isSelected;
          return (
            <PillItem
              key={item.id}
              item={item}
              mutables={getPillMutables(item.id)}
              isSelected={isSelected}
              isDisabled={isDisabled}
              onPress={() => onToggle(item.id)}
            />
          );
        })}
      </View>
    </Animated.View>
  );
});

export default function SubcategoriesScreen() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [interestIds, setInterestIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const counterOpacity = useSharedValue(0);
  const counterY = useSharedValue(14);
  const prevSelectedRef = useRef<Set<string>>(new Set());
  const groupMutables = useRef<GroupMutables[]>(
    Array.from({ length: MAX_GROUPS }, () => ({
      opacity: makeMutable(0),
      y: makeMutable(20),
      titleX: makeMutable(-10),
    }))
  ).current;
  const pillMutableMap = useRef(new Map<string, PillMutables>());

  const getPillMutables = useCallback((id: string): PillMutables => {
    const existing = pillMutableMap.current.get(id);
    if (existing) return existing;
    const created: PillMutables = {
      opacity: makeMutable(0),
      entryScale: makeMutable(0.8),
      selectedScale: makeMutable(1),
      x: makeMutable(0),
      y: makeMutable(0),
      tapScale: makeMutable(1),
      checkScale: makeMutable(0),
    };
    pillMutableMap.current.set(id, created);
    return created;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const [storedInterests, storedSubcategories] = await Promise.all([
          AsyncStorage.getItem('onboarding_interests'),
          AsyncStorage.getItem('onboarding_subcategories'),
        ]);

        const parsedInterests = storedInterests ? (JSON.parse(storedInterests) as string[]) : [];
        const parsedSubcategories = storedSubcategories ? (JSON.parse(storedSubcategories) as string[]) : [];

        if (!cancelled && parsedInterests.length > 0) {
          setInterestIds(parsedInterests.filter((id) => Boolean(SUBCATEGORY_MAP[id])));
        }
        if (!cancelled && parsedSubcategories.length > 0) {
          setSelected(new Set(parsedSubcategories));
        }

        if (parsedInterests.length > 0 && parsedSubcategories.length > 0) return;

        const preferences = await apiFetch<PreferencesResponseDto>('/api/user/preferences');
        const apiInterestIds = (preferences.interests ?? [])
          .map((item) => item.id)
          .filter((id) => Boolean(SUBCATEGORY_MAP[id]));
        const apiSubcategories = (preferences.subcategories ?? [])
          .map((item) => item.id)
          .filter((id) => id.length > 0);

        if (!cancelled && parsedInterests.length === 0 && apiInterestIds.length > 0) {
          setInterestIds(apiInterestIds);
          await AsyncStorage.setItem('onboarding_interests', JSON.stringify(apiInterestIds));
        }

        if (!cancelled && parsedSubcategories.length === 0 && apiSubcategories.length > 0) {
          setSelected(new Set(apiSubcategories));
          await AsyncStorage.setItem('onboarding_subcategories', JSON.stringify(apiSubcategories));
        }
      } catch {
        // Ignore hydration errors; users can continue selecting in-session.
      }
    }

    hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      counterOpacity.value = 1;
      counterY.value = 0;
      return;
    }
    const ease = Easing.bezier(0.25, 0.8, 0.25, 1);
    counterOpacity.value = withDelay(130, withTiming(1, { duration: 320, easing: ease }));
    counterY.value = withDelay(130, withTiming(0, { duration: 320, easing: ease }));
  }, [counterOpacity, counterY, reducedMotion]);

  const visibleGroups = useMemo(
    () =>
      interestIds
        .filter((id) => Boolean(SUBCATEGORY_MAP[id]))
        .map((id) => ({ interestId: id, ...SUBCATEGORY_MAP[id] })),
    [interestIds]
  );

  useEffect(() => {
    if (reducedMotion) {
      visibleGroups.forEach((_, groupIndex) => {
        const m = groupMutables[groupIndex];
        if (!m) return;
        m.opacity.value = 1;
        m.y.value = 0;
        m.titleX.value = 0;
      });
      return;
    }

    const ease = Easing.bezier(0.25, 0.8, 0.25, 1);
    visibleGroups.forEach((_, groupIndex) => {
      const m = groupMutables[groupIndex];
      if (!m) return;
      m.opacity.value = 0;
      m.y.value = 20;
      m.titleX.value = -10;
      m.opacity.value = withDelay(groupIndex * 80, withTiming(1, { duration: 400, easing: ease }));
      m.y.value = withDelay(groupIndex * 80, withTiming(0, { duration: 400, easing: ease }));
      m.titleX.value = withDelay(groupIndex * 80, withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) }));
    });
  }, [groupMutables, reducedMotion, visibleGroups]);

  useEffect(() => {
    visibleGroups.forEach((group, groupIndex) => {
      group.items.forEach((item, itemIndex) => {
        const m = getPillMutables(item.id);

        if (reducedMotion) {
          m.opacity.value = 1;
          m.entryScale.value = 1;
          return;
        }

        const ease = Easing.bezier(0.25, 0.8, 0.25, 1);
        m.opacity.value = 0;
        m.entryScale.value = 0.8;
        m.opacity.value = withDelay(
          groupIndex * 80 + 50 + itemIndex * 30,
          withTiming(1, { duration: 300, easing: ease })
        );
        m.entryScale.value = withDelay(
          groupIndex * 80 + 50 + itemIndex * 30,
          withTiming(1, { duration: 300, easing: ease })
        );
      });
    });
  }, [getPillMutables, reducedMotion, visibleGroups]);

  useEffect(() => {
    const prevSelected = prevSelectedRef.current;
    const visibleIds = new Set(visibleGroups.flatMap((group) => group.items.map((item) => item.id)));
    visibleIds.forEach((id) => {
      const m = getPillMutables(id);
      const wasSelected = prevSelected.has(id);
      const isSelected = selected.has(id);
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
  }, [getPillMutables, reducedMotion, selected, visibleGroups]);

  const triggerShake = useCallback((id: string) => {
    if (reducedMotion) return;
    const m = getPillMutables(id);
    m.x.value = 0;
    m.x.value = withSequence(
      withTiming(-4, { duration: 70, easing: Easing.inOut(Easing.ease) }),
      withTiming(4, { duration: 70, easing: Easing.inOut(Easing.ease) }),
      withTiming(-3, { duration: 70, easing: Easing.inOut(Easing.ease) }),
      withTiming(2, { duration: 70, easing: Easing.inOut(Easing.ease) }),
      withTiming(0, { duration: 70, easing: Easing.inOut(Easing.ease) })
    );
  }, [getPillMutables, reducedMotion]);

  const triggerExcite = useCallback((id: string) => {
    if (reducedMotion) return;
    const m = getPillMutables(id);
    m.tapScale.value = 1;
    m.y.value = 0;
    m.tapScale.value = withTiming(
      1.06,
      { duration: 110, easing: Easing.bezier(0.2, 0.9, 0.2, 1) },
      (finished) => {
        'worklet';
        if (finished) {
          m.tapScale.value = withSpring(1, { stiffness: 420, damping: 18, mass: 0.65 });
        }
      }
    );
    m.y.value = withTiming(
      -2,
      { duration: 110, easing: Easing.out(Easing.cubic) },
      (finished) => {
        'worklet';
        if (finished) {
          m.y.value = withSpring(0, { stiffness: 360, damping: 22, mass: 0.75 });
        }
      }
    );
  }, [getPillMutables, reducedMotion]);

  const toggle = useCallback((id: string) => {
    try { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    triggerExcite(id);
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
  }, [triggerExcite, triggerShake]);

  const canContinue = selected.size >= MIN;
  const atMax = selected.size >= MAX;

  const handleContinue = useCallback(async () => {
    if (!canContinue || isLoading) return;
    try { void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    setIsLoading(true);
    setError('');
    try {
      const ids = Array.from(selected);
      await apiFetch('/api/onboarding/subcategories', {
        method: 'POST',
        body: JSON.stringify({ subcategories: ids }),
      });
      await AsyncStorage.setItem('onboarding_subcategories', JSON.stringify(ids));
      router.push(routes.dealBreakers() as never);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save subcategories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [canContinue, isLoading, router, selected]);

  const handleBack = () => router.back();

  const helperText =
    selected.size === 0
      ? 'Select at least one subcategory to continue'
      : selected.size === MAX
        ? "Perfect! You've selected the maximum"
        : 'Great! Select more or continue';

  const counterAnimStyle = useAnimatedStyle(() => ({
    opacity: counterOpacity.value,
    transform: [{ translateY: counterY.value }],
  }), []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <OnboardingLayout
        step={2}
        totalSteps={4}
        title="Let's Get More Specific!"
        subtitle="Select specific areas within your interests"
        titleTyping
        titleTypingDelayMs={300}
        titleTypingSpeedMs={40}
        onBack={handleBack}
        onContinue={handleContinue}
        canContinue={canContinue}
        isLoading={isLoading}
      >
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Animated.View style={[styles.counterWrap, counterAnimStyle]}>
          <View style={[styles.counterPill, selected.size > 0 && styles.counterPillReady]}>
            <Text style={styles.counterText}>{selected.size} of {MAX} selected</Text>
            {selected.size > 0 ? <Ionicons name="checkmark-circle-outline" size={15} color={ONBOARDING_TOKENS.sage} /> : null}
          </View>
          <Text style={styles.counterHint}>{helperText}</Text>
        </Animated.View>

        {visibleGroups.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No subcategories found for selected interests.</Text>
          </View>
        ) : (
          visibleGroups.map((group, index) => {
            const m = groupMutables[index] ?? groupMutables[0];
            return (
              <GroupSection
                key={group.interestId}
                group={group}
                mutables={m}
                getPillMutables={getPillMutables}
                selected={selected}
                atMax={atMax}
                onToggle={toggle}
              />
            );
          })
        )}
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

  counterWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  counterPill: {
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
    marginTop: 7,
    fontSize: 13,
    lineHeight: 18,
    color: ONBOARDING_TOKENS.charcoal60,
    fontWeight: '600',
    textAlign: 'center',
  },

  group: {
    marginBottom: 20,
  },
  groupLabel: {
    fontSize: 17,
    lineHeight: 22,
    color: ONBOARDING_TOKENS.charcoal,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 12,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  pill: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(157,171,155,0.3)',
    overflow: 'hidden',
  },
  pillFill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  pillSelected: {
    borderColor: ONBOARDING_TOKENS.coral,
  },
  pillDisabled: {
    opacity: 0.42,
  },
  pillPressed: {
    transform: [{ scale: 0.97 }],
  },
  pillText: {
    color: ONBOARDING_TOKENS.sage,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  pillTextSelected: {
    color: ONBOARDING_TOKENS.white,
  },

  emptyState: {
    paddingVertical: 18,
  },
  emptyStateText: {
    textAlign: 'center',
    color: ONBOARDING_TOKENS.charcoal60,
    fontSize: 14,
    fontWeight: '400',
  },
});
