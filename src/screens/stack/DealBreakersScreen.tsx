import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { Text } from '../../components/Typography';
import { apiFetch } from '../../lib/api';
import { routes } from '../../navigation/routes';

const MIN = 1;
const MAX = 3;

type IoniconName = 'shield-checkmark-outline' | 'time-outline' | 'happy-outline' | 'pricetag-outline';

const DEALBREAKERS: { id: string; label: string; description: string; icon: IoniconName }[] = [
  {
    id: 'trustworthiness',
    label: 'Trustworthiness',
    description: 'Reliable and honest service you can count on',
    icon: 'shield-checkmark-outline',
  },
  {
    id: 'punctuality',
    label: 'Punctuality',
    description: 'On-time and respects your schedule',
    icon: 'time-outline',
  },
  {
    id: 'friendliness',
    label: 'Friendliness',
    description: 'Welcoming and personable staff',
    icon: 'happy-outline',
  },
  {
    id: 'value-for-money',
    label: 'Value for Money',
    description: 'Great quality at fair prices',
    icon: 'pricetag-outline',
  },
];

export default function DealBreakersScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Counter entrance
  const counterOpacity = useRef(new Animated.Value(0)).current;
  const counterY       = useRef(new Animated.Value(14)).current;

  // Per-card entrance — opacity + translateY + scale spring
  const cardAnims = useRef(
    DEALBREAKERS.map(() => ({
      opacity: new Animated.Value(0),
      y:       new Animated.Value(20),
      scale:   new Animated.Value(0.92),
    }))
  ).current;

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);

    // Counter at 150ms
    Animated.parallel([
      Animated.timing(counterOpacity, { toValue: 1, delay: 150, duration: 340, useNativeDriver: true }),
      Animated.timing(counterY,       { toValue: 0, delay: 150, duration: 340, easing: ease, useNativeDriver: true }),
    ]).start();

    // Cards: stagger 80ms apart from 210ms — spring scale for tactile pop
    DEALBREAKERS.forEach((_, i) => {
      const delay = 210 + i * 80;
      const anim = cardAnims[i];
      Animated.parallel([
        Animated.timing(anim.opacity, { toValue: 1, delay, duration: 340, useNativeDriver: true }),
        Animated.timing(anim.y,       { toValue: 0, delay, duration: 340, easing: ease, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(delay),
          Animated.spring(anim.scale, { toValue: 1, damping: 12, stiffness: 200, useNativeDriver: true }),
        ]),
      ]).start();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = useCallback((id: string) => {
    setSelected(prev => {
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
    setIsLoading(true);
    try {
      const ids = Array.from(selected);
      await apiFetch('/api/onboarding/deal-breakers', {
        method: 'POST',
        body: JSON.stringify({ dealbreakers: ids }),
      });
      await AsyncStorage.setItem('onboarding_dealbreakers', JSON.stringify(ids));
      router.push(routes.completeProfile() as never);
    } catch {
      const ids = Array.from(selected);
      await AsyncStorage.setItem('onboarding_dealbreakers', JSON.stringify(ids));
      router.push(routes.completeProfile() as never);
    } finally {
      setIsLoading(false);
    }
  }, [canContinue, isLoading, selected, router]);

  const handleBack = () => router.push(routes.subcategories() as never);

  const selectionLabel =
    selected.size === 0 ? `Pick up to ${MAX}` : `${selected.size} of ${MAX} selected`;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <OnboardingLayout
        step={3}
        totalSteps={4}
        title="What are your deal-breakers?"
        subtitle="Select what matters most to you in a business."
        onBack={handleBack}
        onContinue={handleContinue}
        continueLabel="Complete Setup"
        canContinue={canContinue}
        isLoading={isLoading}
      >
        {/* Counter */}
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

        {/* Cards — each springs in */}
        <View style={styles.cards}>
          {DEALBREAKERS.map((item, i) => {
            const isSelected = selected.has(item.id);
            const isDisabled = atMax && !isSelected;
            const anim = cardAnims[i];
            return (
              <Animated.View
                key={item.id}
                style={{ opacity: anim.opacity, transform: [{ translateY: anim.y }, { scale: anim.scale }] }}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.card,
                    isSelected && styles.cardSelected,
                    isDisabled && styles.cardDisabled,
                    pressed && !isDisabled && styles.cardPressed,
                  ]}
                  onPress={() => toggle(item.id)}
                  disabled={isDisabled}
                >
                  <View style={[styles.iconWrap, isSelected && styles.iconWrapSelected]}>
                    <Ionicons
                      name={item.icon}
                      size={26}
                      color={isSelected ? '#FFFFFF' : '#722F37'}
                    />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.cardDesc, isSelected && styles.cardDescSelected]}>
                      {item.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={14} color="#7D9B76" />
                    </View>
                  )}
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </OnboardingLayout>
    </>
  );
}

const styles = StyleSheet.create({
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  counterTxt: { fontSize: 13, fontWeight: '600', color: 'rgba(45,45,45,0.45)' },
  counterTxtGreen: { color: '#7D9B76' },

  cards: { gap: 12 },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16, padding: 16,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    position: 'relative',
  },
  cardSelected: {
    backgroundColor: 'rgba(125,155,118,0.15)', borderColor: '#7D9B76',
    shadowColor: '#7D9B76', shadowOpacity: 0.2, shadowRadius: 10,
  },
  cardDisabled: { opacity: 0.38 },
  cardPressed: { transform: [{ scale: 0.98 }] },

  iconWrap: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: 'rgba(114,47,55,0.10)',
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapSelected: { backgroundColor: '#7D9B76' },

  cardText: { flex: 1 },
  cardLabel: { fontSize: 15, fontWeight: '700', color: '#2D2D2D', marginBottom: 3 },
  cardLabelSelected: { color: '#3a6b35' },
  cardDesc: { fontSize: 13, lineHeight: 18, color: 'rgba(45,45,45,0.60)', fontWeight: '400' },
  cardDescSelected: { color: 'rgba(45,45,45,0.70)' },

  checkBadge: {
    position: 'absolute', top: 12, right: 12,
    width: 22, height: 22, borderRadius: 999,
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#7D9B76',
  },
});
