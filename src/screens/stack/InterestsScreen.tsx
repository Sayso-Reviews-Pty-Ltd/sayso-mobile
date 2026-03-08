import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { Text } from '../../components/Typography';
import { apiFetch } from '../../lib/api';
import { routes } from '../../navigation/routes';

const MIN = 3;
const MAX = 6;

const INTERESTS = [
  { id: 'food-drink',                label: 'Food & Drink',          icon: 'restaurant-outline' },
  { id: 'beauty-wellness',           label: 'Beauty & Wellness',     icon: 'flower-outline' },
  { id: 'professional-services',     label: 'Professional Services', icon: 'briefcase-outline' },
  { id: 'travel',                    label: 'Travel',                icon: 'airplane-outline' },
  { id: 'outdoors-adventure',        label: 'Outdoors & Adventure',  icon: 'compass-outline' },
  { id: 'entertainment-experiences', label: 'Entertainment',         icon: 'film-outline' },
  { id: 'arts-culture',              label: 'Arts & Culture',        icon: 'color-palette-outline' },
  { id: 'family-pets',               label: 'Family & Pets',         icon: 'people-outline' },
  { id: 'shopping-lifestyle',        label: 'Shopping & Lifestyle',  icon: 'bag-handle-outline' },
] as const;

type InterestId = typeof INTERESTS[number]['id'];

// Per-pill entrance: opacity, translateY, scale
type PillAnim = { opacity: Animated.Value; y: Animated.Value; scale: Animated.Value };

export default function InterestsScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<InterestId>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Counter row entrance
  const counterOpacity = useRef(new Animated.Value(0)).current;
  const counterY       = useRef(new Animated.Value(14)).current;

  // Per-pill entrance animations — created once in ref
  const pillAnims = useRef<PillAnim[]>(
    INTERESTS.map(() => ({
      opacity: new Animated.Value(0),
      y:       new Animated.Value(16),
      scale:   new Animated.Value(0.88),
    }))
  ).current;

  // Shake animation ref for when max is hit
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);

    // Counter: fade-up at 150ms
    Animated.parallel([
      Animated.timing(counterOpacity, { toValue: 1, delay: 150, duration: 340, useNativeDriver: true }),
      Animated.timing(counterY,       { toValue: 0, delay: 150, duration: 340, easing: ease, useNativeDriver: true }),
    ]).start();

    // Pills: stagger 35ms apart starting at 200ms
    INTERESTS.forEach((_, i) => {
      const delay = 200 + i * 38;
      const anim = pillAnims[i];
      Animated.parallel([
        Animated.timing(anim.opacity, { toValue: 1, delay, duration: 300, useNativeDriver: true }),
        Animated.timing(anim.y,       { toValue: 0, delay, duration: 300, easing: ease, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(delay),
          Animated.spring(anim.scale, { toValue: 1, damping: 13, stiffness: 220, useNativeDriver: true }),
        ]),
      ]).start();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue:  6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  4, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -4, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  0, duration: 40, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const toggle = useCallback((id: InterestId) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX) {
        next.add(id);
      } else {
        triggerShake();
      }
      return next;
    });
  }, [triggerShake]);

  const canContinue = selected.size >= MIN && selected.size <= MAX;
  const atMax = selected.size >= MAX;

  const handleContinue = useCallback(async () => {
    if (!canContinue || isLoading) return;
    setIsLoading(true);
    try {
      const ids = Array.from(selected);
      await apiFetch('/api/onboarding/interests', {
        method: 'POST',
        body: JSON.stringify({ interests: ids }),
      });
      await AsyncStorage.setItem('onboarding_interests', JSON.stringify(ids));
      router.push(routes.subcategories() as never);
    } catch {
      const ids = Array.from(selected);
      await AsyncStorage.setItem('onboarding_interests', JSON.stringify(ids));
      router.push(routes.subcategories() as never);
    } finally {
      setIsLoading(false);
    }
  }, [canContinue, isLoading, selected, router]);

  const handleBack = () => router.push(routes.onboarding() as never);

  const selectionLabel =
    selected.size === 0
      ? `Pick at least ${MIN}`
      : selected.size < MIN
      ? `${selected.size} of ${MIN} minimum`
      : `${selected.size} of ${MAX} selected`;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <OnboardingLayout
        step={1}
        totalSteps={4}
        title="What interests you?"
        subtitle="Pick a few things you love and we'll personalise your experience!"
        onBack={handleBack}
        onContinue={handleContinue}
        canContinue={canContinue}
        isLoading={isLoading}
      >
        {/* Selection counter */}
        <Animated.View style={[styles.counterRow, { opacity: counterOpacity, transform: [{ translateY: counterY }] }]}>
          <Ionicons
            name={selected.size >= MIN ? 'checkmark-circle' : 'ellipse-outline'}
            size={16}
            color={selected.size >= MIN ? '#7D9B76' : 'rgba(45,45,45,0.4)'}
          />
          <Text style={[styles.counterTxt, selected.size >= MIN && styles.counterTxtGreen]}>
            {selectionLabel}
          </Text>
        </Animated.View>

        {/* 2-column grid with shake container */}
        <Animated.View style={[styles.grid, { transform: [{ translateX: shakeAnim }] }]}>
          {INTERESTS.map((item, i) => {
            const isSelected = selected.has(item.id);
            const isDisabled = atMax && !isSelected;
            const anim = pillAnims[i];
            return (
              <Animated.View
                key={item.id}
                style={{
                  width: '47.5%',
                  opacity: anim.opacity,
                  transform: [{ translateY: anim.y }, { scale: anim.scale }],
                }}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.pill,
                    isSelected && styles.pillSelected,
                    isDisabled && styles.pillDisabled,
                    pressed && !isDisabled && styles.pillPressed,
                  ]}
                  onPress={() => toggle(item.id)}
                  disabled={isDisabled}
                >
                  <Ionicons
                    name={item.icon as never}
                    size={22}
                    color={isSelected ? '#FFFFFF' : 'rgba(45,45,45,0.7)'}
                  />
                  <Text style={[styles.pillLabel, isSelected && styles.pillLabelSelected]}>
                    {item.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={10} color="#7D9B76" />
                    </View>
                  )}
                </Pressable>
              </Animated.View>
            );
          })}
        </Animated.View>
      </OnboardingLayout>
    </>
  );
}

const styles = StyleSheet.create({
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  counterTxt: { fontSize: 13, fontWeight: '600', color: 'rgba(45,45,45,0.45)' },
  counterTxtGreen: { color: '#7D9B76' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  pill: {
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 20, paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    position: 'relative',
  },
  pillSelected: {
    backgroundColor: '#7D9B76', borderColor: '#7D9B76',
    shadowColor: '#7D9B76', shadowOpacity: 0.3, shadowRadius: 10,
  },
  pillDisabled: { opacity: 0.38 },
  pillPressed: { transform: [{ scale: 0.96 }] },

  pillLabel: {
    fontSize: 13, fontWeight: '600', color: 'rgba(45,45,45,0.8)',
    textAlign: 'center', lineHeight: 18,
  },
  pillLabelSelected: { color: '#FFFFFF' },

  checkBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 18, height: 18, borderRadius: 999,
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
  },
});
