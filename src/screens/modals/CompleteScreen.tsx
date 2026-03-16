import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, withSequence,
  withRepeat, cancelAnimation, Easing, interpolate, makeMutable, type SharedValue,
} from 'react-native-reanimated';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { ONBOARDING_TOKENS } from '../../components/onboarding/onboardingTheme';
import { Text } from '../../components/Typography';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { apiFetch } from '../../lib/api';
import { routes } from '../../navigation/routes';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PARTICLE_COUNT = 180;
const FALL_DISTANCE = SCREEN_HEIGHT + 160;

type ParticleShape = 'square' | 'circle' | 'rect';

function Particle({
  delay,
  x,
  color,
  size,
  drift,
  fallDuration,
  shape,
  spinMultiplier,
}: {
  delay: number;
  x: number;
  color: string;
  size: number;
  drift: number;
  fallDuration: number;
  shape: ParticleShape;
  spinMultiplier: number;
}) {
  const y = useSharedValue(-size);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 120 }));

    y.value = withDelay(
      delay,
      withTiming(FALL_DISTANCE, { duration: fallDuration, easing: Easing.linear }, (finished) => {
        'worklet';
        if (finished) {
          opacity.value = withTiming(0, { duration: 180 });
        }
      })
    );

    rotation.value = withDelay(
      delay,
      withTiming(360 * spinMultiplier, { duration: fallDuration, easing: Easing.linear })
    );

    translateX.value = withDelay(
      delay,
      withSequence(
        withTiming(drift, { duration: fallDuration * 0.5, easing: Easing.inOut(Easing.sin) }),
        withTiming(-drift * 0.6, { duration: fallDuration * 0.5, easing: Easing.inOut(Easing.sin) })
      )
    );
  }, [delay, drift, fallDuration, opacity, rotation, spinMultiplier, translateX, y]);

  const width = shape === 'rect' ? size * 0.4 : size;
  const height = shape === 'rect' ? size * 1.8 : size;
  const borderRadius = shape === 'circle' ? size / 2 : shape === 'rect' ? 2 : size / 5;

  const particleStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: y.value },
      { translateX: translateX.value },
      { rotate: `${rotation.value}deg` },
    ],
  }), []);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: x,
          width,
          height,
          borderRadius,
          backgroundColor: color,
        },
        particleStyle,
      ]}
      pointerEvents="none"
    />
  );
}

type DealbreakerIconName = 'shield-checkmark-outline' | 'time-outline' | 'happy-outline' | 'pricetag-outline';

function FloatingIcon({ icon, floatValue }: { icon: DealbreakerIconName; floatValue: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(floatValue.value, [0, 1], [0, -8]) }],
  }), []);

  return (
    <Animated.View style={style}>
      <View style={styles.iconBubble}>
        <Ionicons name={icon} size={22} color={ONBOARDING_TOKENS.sage} />
      </View>
    </Animated.View>
  );
}

const DEALBREAKER_ICONS: Record<string, DealbreakerIconName> = {
  trustworthiness: 'shield-checkmark-outline',
  punctuality: 'time-outline',
  friendliness: 'happy-outline',
  'value-for-money': 'pricetag-outline',
};

const CONFETTI_COLORS = [
  ONBOARDING_TOKENS.coral,
  ONBOARDING_TOKENS.sage,
  ONBOARDING_TOKENS.offWhite,
  '#722F37',
  '#9DAB9B',
  '#F4C842',
  '#E8735A',
  '#A8D5A2',
  '#F9E4B7',
  '#C9A0DC',
  '#FFB347',
  '#87CEEB',
  '#FF6B9D',
  '#B5EAD7',
  '#FFDAC1',
];

const PARTICLE_SHAPES: ParticleShape[] = ['square', 'circle', 'rect'];

export default function CompleteScreen() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [selectedDealbreakers, setSelectedDealbreakers] = useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);
  const hasCompletedRef = useRef(false);

  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(16);
  const badgeOpacity = useSharedValue(0);
  const badgeY = useSharedValue(12);
  const iconFloat = useRef(Array.from({ length: 4 }, () => makeMutable(0))).current;

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        key: i,
        delay: Math.random() * 1800,
        x: Math.random() * (SCREEN_WIDTH + 60) - 30,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 6 + Math.random() * 11,
        drift: (Math.random() - 0.5) * 80,
        fallDuration: 1600 + Math.random() * 1400,
        shape: PARTICLE_SHAPES[Math.floor(Math.random() * PARTICLE_SHAPES.length)],
        spinMultiplier: 1 + Math.floor(Math.random() * 3),
      })),
    []
  );

  const handleContinue = useCallback(async () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    setIsCompleting(true);

    try {
      await apiFetch('/api/onboarding/complete', { method: 'POST' });
      await AsyncStorage.multiRemove([
        'onboarding_interests',
        'onboarding_subcategories',
        'onboarding_dealbreakers',
      ]);
    } catch {
      // Best effort completion: still move to home to avoid trapping users.
    } finally {
      router.replace(routes.home() as never);
    }
  }, [router]);

  useEffect(() => {
    try { void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}

    AsyncStorage.getItem('onboarding_dealbreakers')
      .then((raw) => {
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setSelectedDealbreakers(parsed.filter((id): id is string => typeof id === 'string'));
          }
        } catch {
          // Ignore malformed cache.
        }
      })
      .catch(() => {
        // Ignore storage errors.
      });

    if (reducedMotion) {
      contentOpacity.value = 1;
      contentY.value = 0;
      badgeOpacity.value = 1;
      badgeY.value = 0;
    } else {
      contentOpacity.value = withDelay(90, withTiming(1, { duration: 360 }));
      contentY.value = withDelay(90, withTiming(0, { duration: 360 }));
      badgeOpacity.value = withDelay(120, withTiming(1, { duration: 300 }));
      badgeY.value = withDelay(120, withTiming(0, { duration: 300 }));
    }

    const timer = setTimeout(() => {
      void handleContinue();
    }, 3500);

    return () => clearTimeout(timer);
  }, [handleContinue, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || selectedDealbreakers.length === 0) {
      iconFloat.forEach((value) => { value.value = 0; });
      return;
    }

    iconFloat.forEach((value, index) => {
      value.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1300 + index * 150, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1300 + index * 150, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    });

    return () => {
      iconFloat.forEach((value) => { cancelAnimation(value); value.value = 0; });
    };
  }, [iconFloat, reducedMotion, selectedDealbreakers.length]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }), []);

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ translateY: badgeY.value }],
  }), []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <OnboardingLayout
        step={4}
        totalSteps={4}
        title="You're all set!"
        subtitle="Time to discover what's out there."
        onContinue={handleContinue}
        continueLabel="Continue to Home"
        loadingLabel="Going to Home..."
        canContinue={!isCompleting}
        isLoading={isCompleting}
        overlay={
          !reducedMotion ? (
            <View style={[StyleSheet.absoluteFill, styles.confettiLayer]} pointerEvents="none">
              {particles.map((particle) => (
                <Particle
                  key={particle.key}
                  delay={particle.delay}
                  x={particle.x}
                  color={particle.color}
                  size={particle.size}
                  drift={particle.drift}
                  fallDuration={particle.fallDuration}
                  shape={particle.shape}
                  spinMultiplier={particle.spinMultiplier}
                />
              ))}
            </View>
          ) : undefined
        }
      >
        <Animated.View style={[styles.content, contentStyle]}>
          {selectedDealbreakers.length > 0 ? (
            <View style={styles.iconRow}>
              {selectedDealbreakers.map((id, index) => {
                const icon = DEALBREAKER_ICONS[id];
                if (!icon) return null;
                return (
                  <FloatingIcon
                    key={id}
                    icon={icon}
                    floatValue={iconFloat[index % iconFloat.length]}
                  />
                );
              })}
            </View>
          ) : null}

          <Animated.View style={badgeStyle}>
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle-outline" size={14} color={ONBOARDING_TOKENS.sage} />
              <Text style={styles.badgeText}>Setup Complete</Text>
            </View>
            <Text style={styles.autoRedirectHint}>Redirecting automatically...</Text>
          </Animated.View>
        </Animated.View>
      </OnboardingLayout>
    </>
  );
}

const styles = StyleSheet.create({
  confettiLayer: {
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    gap: 18,
    marginBottom: 8,
  },
  iconRow: {
    marginTop: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  iconBubble: {
    width: 46,
    height: 46,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(157,171,155,0.32)',
    backgroundColor: 'rgba(157,171,155,0.16)',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(157,171,155,0.15)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(157,171,155,0.35)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: ONBOARDING_TOKENS.sage,
  },
  autoRedirectHint: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(45,45,45,0.60)',
    textAlign: 'center',
  },
});
