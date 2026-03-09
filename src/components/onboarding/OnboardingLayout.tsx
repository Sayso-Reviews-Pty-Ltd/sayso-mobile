import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../Typography';

const C = {
  page: '#E5E0E5',
  wine: '#722F37',
  sage: '#7D9B76',
  white: '#FFFFFF',
};

type Props = {
  step: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
  continueVariant?: 'continue' | 'complete';
  canContinue: boolean;
  isLoading?: boolean;
  titleTyping?: boolean;
  titleTypingDelayMs?: number;
  titleTypingSpeedMs?: number;
  children: ReactNode;
};

export function OnboardingLayout({
  step,
  totalSteps,
  title,
  subtitle,
  onBack,
  onContinue,
  continueLabel = 'Continue',
  continueVariant = 'continue',
  canContinue,
  isLoading = false,
  titleTyping = false,
  titleTypingDelayMs = 300,
  titleTypingSpeedMs = 40,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const progressPercentage = Math.max(0, Math.min(100, (step / totalSteps) * 100));
  const isCompleteVariant = continueVariant === 'complete';
  const hasBack = Boolean(onBack);
  const progressEase = useRef(Easing.bezier(0.4, 0, 0.2, 1)).current;

  // Title: slide-up + fade
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY       = useRef(new Animated.Value(10)).current;

  // Subtitle: slide-up + fade
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleY       = useRef(new Animated.Value(10)).current;

  // Action area: fade-up
  const actionOpacity = useRef(new Animated.Value(0)).current;
  const actionY       = useRef(new Animated.Value(16)).current;

  // Web-parity progress/back animations
  const progressScaleX = useRef(new Animated.Value(0)).current;
  const activeDotScale = useRef(new Animated.Value(1)).current;
  const backOpacity = useRef(new Animated.Value(0)).current;
  const backY = useRef(new Animated.Value(30)).current;
  const [displayTitle, setDisplayTitle] = useState(titleTyping ? '' : title);

  useEffect(() => {
    if (!titleTyping) {
      setDisplayTitle(title);
      return;
    }

    setDisplayTitle('');
    let charIndex = 0;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const startTimeout = setTimeout(() => {
      intervalId = setInterval(() => {
        charIndex += 1;
        setDisplayTitle(title.slice(0, charIndex));
        if (charIndex >= title.length && intervalId) {
          clearInterval(intervalId);
        }
      }, titleTypingSpeedMs);
    }, titleTypingDelayMs);

    return () => {
      clearTimeout(startTimeout);
      if (intervalId) clearInterval(intervalId);
    };
  }, [title, titleTyping, titleTypingDelayMs, titleTypingSpeedMs]);

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);

    Animated.parallel([
      Animated.timing(titleOpacity, { toValue: 1, delay: 50, duration: 400, useNativeDriver: true }),
      Animated.timing(titleY,       { toValue: 0, delay: 50, duration: 400, easing: ease, useNativeDriver: true }),
    ]).start();

    Animated.parallel([
      Animated.timing(subtitleOpacity, { toValue: 1, delay: 110, duration: 400, useNativeDriver: true }),
      Animated.timing(subtitleY,       { toValue: 0, delay: 110, duration: 400, easing: ease, useNativeDriver: true }),
    ]).start();

    Animated.parallel([
      Animated.timing(actionOpacity, { toValue: 1, delay: 180, duration: 320, useNativeDriver: true }),
      Animated.timing(actionY,       { toValue: 0, delay: 180, duration: 320, easing: ease, useNativeDriver: true }),
    ]).start();
  }, [actionOpacity, actionY, subtitleOpacity, subtitleY, titleOpacity, titleY]);

  useEffect(() => {
    progressScaleX.setValue(0);
    Animated.timing(progressScaleX, {
      toValue: 1,
      duration: 800,
      easing: progressEase,
      useNativeDriver: true,
    }).start();
  }, [progressScaleX, step]);

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(activeDotScale, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(activeDotScale, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => {
      pulseLoop.stop();
      activeDotScale.setValue(1);
    };
  }, [activeDotScale]);

  useEffect(() => {
    if (!hasBack) return;
    backOpacity.setValue(0);
    backY.setValue(30);
    Animated.parallel([
      Animated.timing(backOpacity, {
        toValue: 1,
        delay: 100,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backY, {
        toValue: 0,
        delay: 100,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [backOpacity, backY, hasBack]);

  return (
    <View style={[styles.root, { backgroundColor: C.page }]}>
      <View style={styles.topProgressTrack}>
        <Animated.View
          style={[
            styles.topProgressFill,
            {
              width: `${progressPercentage}%`,
              transform: [{ scaleX: progressScaleX }],
            },
          ]}
        />
      </View>

      {hasBack ? (
        <Animated.View
          style={[
            styles.backWrap,
            { top: insets.top + 8 },
            { opacity: backOpacity, transform: [{ translateY: backY }] },
          ]}
        >
          <Pressable style={styles.backBtn} onPress={onBack} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color={C.white} />
          </Pressable>
        </Animated.View>
      ) : null}

      <Animated.ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + 68,
            paddingBottom: insets.bottom + 22,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        decelerationRate="normal"
      >
        <Animated.View style={styles.header}>
          <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleY }] }}>
            <Text style={styles.title}>{displayTitle}</Text>
          </Animated.View>
          <Animated.View style={{ opacity: subtitleOpacity, transform: [{ translateY: subtitleY }] }}>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </Animated.View>
        </Animated.View>

        {children}

        <Animated.View
          style={[styles.actionWrap, { opacity: actionOpacity, transform: [{ translateY: actionY }] }]}
        >
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
              colors={isCompleteVariant ? [C.sage, '#6B8A64'] : [C.wine, '#7A404A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueBtnGradient}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color={C.white} style={styles.loadingSpinner} />
                  <Text style={styles.continueTxt}>Saving…</Text>
                </>
              ) : (
                <>
                  <Text style={styles.continueTxt}>{continueLabel}</Text>
                  <Ionicons name="arrow-forward" size={17} color={C.white} style={{ marginLeft: 8 }} />
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
                  <Animated.View
                    key={dot}
                    style={isActive ? { transform: [{ scale: activeDotScale }] } : undefined}
                  >
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
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },

  topProgressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 4,
    backgroundColor: 'rgba(45,45,45,0.12)',
    zIndex: 20,
  },
  topProgressFill: {
    height: '100%',
    backgroundColor: '#9DAB9B',
    transformOrigin: 'left center',
  },

  backWrap: { position: 'absolute', left: 20, zIndex: 10 },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: '#722F37',
    borderWidth: 1,
    borderColor: 'rgba(114,47,55,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: { paddingHorizontal: 18 },
  header: { marginBottom: 16, alignItems: 'center' },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#2D2D2D',
    letterSpacing: -0.4,
    lineHeight: 40,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '400',
    color: 'rgba(45,45,45,0.70)',
    textAlign: 'center',
    paddingHorizontal: 8,
  },

  actionWrap: { marginTop: 24, paddingBottom: 2, alignItems: 'center' },
  continueBtn: {
    width: '100%',
    maxWidth: 460,
    borderRadius: 999,
    overflow: 'hidden',
  },
  continueBtnGradient: {
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnDisabled: { opacity: 0.42 },
  continueBtnPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  continueTxt: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  loadingSpinner: { marginRight: 8 },

  progressDots: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18 },
  progressDot: { width: 12, height: 12, borderRadius: 999, backgroundColor: 'rgba(66,66,72,0.18)' },
  progressDotActive: { backgroundColor: '#9AB09A' },
  progressDotComplete: { backgroundColor: 'rgba(154,176,154,0.58)' },
  progressLabel: { marginTop: 6, fontSize: 14, color: 'rgba(45,45,45,0.7)', fontWeight: '600' },
});
