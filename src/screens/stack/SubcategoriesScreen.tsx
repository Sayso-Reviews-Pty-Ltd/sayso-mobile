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
const MAX = 10;

type Subcategory = { id: string; label: string };

const SUBCATEGORY_MAP: Record<string, { groupLabel: string; items: Subcategory[] }> = {
  'food-drink': {
    groupLabel: 'Food & Drink',
    items: [
      { id: 'restaurants', label: 'Restaurants' },
      { id: 'cafes',       label: 'Cafes & Coffee' },
      { id: 'bars',        label: 'Bars & Pubs' },
      { id: 'fast-food',   label: 'Fast Food' },
      { id: 'fine-dining', label: 'Fine Dining' },
    ],
  },
  'beauty-wellness': {
    groupLabel: 'Beauty & Wellness',
    items: [
      { id: 'gyms',        label: 'Gyms & Fitness' },
      { id: 'spas',        label: 'Spas' },
      { id: 'salons',      label: 'Hair Salons' },
      { id: 'wellness',    label: 'Wellness Centers' },
      { id: 'nail-salons', label: 'Nail Salons' },
    ],
  },
  'professional-services': {
    groupLabel: 'Professional Services',
    items: [
      { id: 'education-learning', label: 'Education & Learning' },
      { id: 'finance-insurance',  label: 'Finance & Insurance' },
      { id: 'plumbers',           label: 'Plumbers' },
      { id: 'electricians',       label: 'Electricians' },
      { id: 'legal-services',     label: 'Legal Services' },
    ],
  },
  'travel': {
    groupLabel: 'Travel',
    items: [
      { id: 'accommodation',   label: 'Accommodation' },
      { id: 'transport',       label: 'Transport' },
      { id: 'travel-services', label: 'Travel Services' },
    ],
  },
  'outdoors-adventure': {
    groupLabel: 'Outdoors & Adventure',
    items: [
      { id: 'hiking',       label: 'Hiking' },
      { id: 'cycling',      label: 'Cycling' },
      { id: 'water-sports', label: 'Water Sports' },
      { id: 'camping',      label: 'Camping' },
    ],
  },
  'entertainment-experiences': {
    groupLabel: 'Entertainment',
    items: [
      { id: 'events-festivals',  label: 'Events & Festivals' },
      { id: 'sports-recreation', label: 'Sports & Recreation' },
      { id: 'nightlife',         label: 'Nightlife' },
      { id: 'comedy-clubs',      label: 'Comedy Clubs' },
      { id: 'cinemas',           label: 'Cinemas' },
    ],
  },
  'arts-culture': {
    groupLabel: 'Arts & Culture',
    items: [
      { id: 'museums',   label: 'Museums' },
      { id: 'galleries', label: 'Art Galleries' },
      { id: 'theaters',  label: 'Theatres' },
      { id: 'concerts',  label: 'Concerts' },
    ],
  },
  'family-pets': {
    groupLabel: 'Family & Pets',
    items: [
      { id: 'family-activities', label: 'Family Activities' },
      { id: 'pet-services',      label: 'Pet Services' },
      { id: 'childcare',         label: 'Childcare' },
      { id: 'veterinarians',     label: 'Veterinarians' },
    ],
  },
  'shopping-lifestyle': {
    groupLabel: 'Shopping & Lifestyle',
    items: [
      { id: 'fashion',    label: 'Fashion' },
      { id: 'electronics',label: 'Electronics' },
      { id: 'home-decor', label: 'Home & Decor' },
      { id: 'books',      label: 'Books' },
    ],
  },
};

// Max number of groups we might ever show
const MAX_GROUPS = Object.keys(SUBCATEGORY_MAP).length;

export default function SubcategoriesScreen() {
  const router = useRouter();
  const [interestIds, setInterestIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Counter entrance
  const counterOpacity = useRef(new Animated.Value(0)).current;
  const counterY       = useRef(new Animated.Value(14)).current;

  // Per-group entrance — pre-allocate for all possible groups
  const groupAnims = useRef(
    Array.from({ length: MAX_GROUPS }, () => ({
      opacity: new Animated.Value(0),
      y:       new Animated.Value(18),
    }))
  ).current;

  useEffect(() => {
    AsyncStorage.getItem('onboarding_interests').then(raw => {
      if (raw) setInterestIds(JSON.parse(raw));
    });
  }, []);

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);

    // Counter at 150ms
    Animated.parallel([
      Animated.timing(counterOpacity, { toValue: 1, delay: 150, duration: 340, useNativeDriver: true }),
      Animated.timing(counterY,       { toValue: 0, delay: 150, duration: 340, easing: ease, useNativeDriver: true }),
    ]).start();

    // Groups stagger at 60ms intervals starting at 210ms
    groupAnims.forEach((anim, i) => {
      const delay = 210 + i * 60;
      Animated.parallel([
        Animated.timing(anim.opacity, { toValue: 1, delay, duration: 360, useNativeDriver: true }),
        Animated.timing(anim.y,       { toValue: 0, delay, duration: 360, easing: ease, useNativeDriver: true }),
      ]).start();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleGroups = interestIds.length > 0
    ? interestIds.filter(id => SUBCATEGORY_MAP[id]).map(id => ({ interestId: id, ...SUBCATEGORY_MAP[id] }))
    : Object.entries(SUBCATEGORY_MAP).map(([interestId, group]) => ({ interestId, ...group }));

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
      await apiFetch('/api/onboarding/subcategories', {
        method: 'POST',
        body: JSON.stringify({ subcategories: ids }),
      });
      await AsyncStorage.setItem('onboarding_subcategories', JSON.stringify(ids));
      router.push(routes.dealBreakers() as never);
    } catch {
      const ids = Array.from(selected);
      await AsyncStorage.setItem('onboarding_subcategories', JSON.stringify(ids));
      router.push(routes.dealBreakers() as never);
    } finally {
      setIsLoading(false);
    }
  }, [canContinue, isLoading, selected, router]);

  const handleBack = () => router.push(routes.interests() as never);

  const selectionLabel =
    selected.size === 0 ? 'Select at least 1' : `${selected.size} of ${MAX} selected`;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <OnboardingLayout
        step={2}
        totalSteps={4}
        title="Get more specific!"
        subtitle="Select specific areas within your interests."
        onBack={handleBack}
        onContinue={handleContinue}
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

        {/* Groups — each fades+slides up with staggered delay */}
        {visibleGroups.map((group, gi) => {
          const anim = groupAnims[gi] ?? groupAnims[0];
          return (
            <Animated.View
              key={group.interestId}
              style={[styles.group, { opacity: anim.opacity, transform: [{ translateY: anim.y }] }]}
            >
              <Text style={styles.groupLabel}>{group.groupLabel}</Text>
              <View style={styles.pillRow}>
                {group.items.map(item => {
                  const isSelected = selected.has(item.id);
                  const isDisabled = atMax && !isSelected;
                  return (
                    <Pressable
                      key={item.id}
                      style={({ pressed }) => [
                        styles.pill,
                        isSelected && styles.pillSelected,
                        isDisabled && styles.pillDisabled,
                        pressed && !isDisabled && styles.pillPressed,
                      ]}
                      onPress={() => toggle(item.id)}
                      disabled={isDisabled}
                    >
                      {isSelected && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                      <Text style={[styles.pillLabel, isSelected && styles.pillLabelSelected]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>
          );
        })}
      </OnboardingLayout>
    </>
  );
}

const styles = StyleSheet.create({
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  counterTxt: { fontSize: 13, fontWeight: '600', color: 'rgba(45,45,45,0.45)' },
  counterTxtGreen: { color: '#7D9B76' },

  group: { marginBottom: 22 },
  groupLabel: {
    fontSize: 13, fontWeight: '700', color: 'rgba(45,45,45,0.55)',
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 9,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 999, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  pillSelected: {
    backgroundColor: '#7D9B76', borderColor: '#7D9B76',
    shadowColor: '#7D9B76', shadowOpacity: 0.25, shadowRadius: 6,
  },
  pillDisabled: { opacity: 0.35 },
  pillPressed: { transform: [{ scale: 0.95 }] },
  pillLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(45,45,45,0.8)' },
  pillLabelSelected: { color: '#FFFFFF' },
});
