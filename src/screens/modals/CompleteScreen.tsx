import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, withSequence,
  withRepeat, cancelAnimation, Easing, makeMutable,
} from 'react-native-reanimated';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { ONBOARDING_TOKENS } from '../../components/onboarding/onboardingTheme';
import { Text } from '../../components/Typography';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { apiFetch } from '../../lib/api';
import { haptics } from '../../lib/haptics';
import { routes } from '../../navigation/routes';
import { useProfile } from '../../providers/ProfileProvider';
import {
  Particle, FloatingIcon,
  DEALBREAKER_ICONS, CONFETTI_COLORS, PARTICLE_SHAPES, PARTICLE_COUNT, SCREEN_WIDTH,
} from './completeScreenParts';
import { completeStyles } from './completeScreenStyles';

export default function CompleteScreen() {
  const router = useRouter();
  const { refreshProfile } = useProfile();
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
      // Flush the stale profile state so RootGuard sees isOnboardingComplete: true
      // before evaluating /home — prevents a redirect loop back to /complete.
      try { await refreshProfile(); } catch { /* non-critical: route to home regardless */ }
      router.replace(routes.home() as never);
    }
  }, [refreshProfile, router]);

  useEffect(() => {
    haptics.complete();

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
            <View style={[StyleSheet.absoluteFill, completeStyles.confettiLayer]} pointerEvents="none">
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
        <Animated.View style={[completeStyles.content, contentStyle]}>
          {selectedDealbreakers.length > 0 ? (
            <View style={completeStyles.iconRow}>
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
            <View style={completeStyles.badge}>
              <Ionicons name="checkmark-circle-outline" size={14} color={ONBOARDING_TOKENS.sage} />
              <Text style={completeStyles.badgeText}>Setup Complete</Text>
            </View>
            <Text style={completeStyles.autoRedirectHint}>Redirecting automatically...</Text>
          </Animated.View>
        </Animated.View>
      </OnboardingLayout>
    </>
  );
}
