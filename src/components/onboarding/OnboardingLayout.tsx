import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../Typography';

const C = {
  page: '#E5E0E5',
  wine: '#722F37',
  charcoal: '#2D2D2D',
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
  canContinue: boolean;
  isLoading?: boolean;
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
  canContinue,
  isLoading = false,
  children,
}: Props) {
  const insets = useSafeAreaInsets();

  // Top bar: slides down from -14px + fades (0ms)
  const topBarOpacity = useRef(new Animated.Value(0)).current;
  const topBarY       = useRef(new Animated.Value(-14)).current;

  // Progress fill: animates from 0 → step/totalSteps (useNativeDriver: false — layout prop)
  const progressFill = useRef(new Animated.Value(0)).current;

  // Title: slide-up + fade (50ms)
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY       = useRef(new Animated.Value(20)).current;

  // Subtitle: slide-up + fade (110ms)
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleY       = useRef(new Animated.Value(18)).current;

  // Footer button: spring pop from below (180ms)
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const footerY       = useRef(new Animated.Value(20)).current;
  const footerScale   = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);

    // Top bar slides down
    Animated.parallel([
      Animated.timing(topBarOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(topBarY,       { toValue: 0, duration: 320, easing: ease, useNativeDriver: true }),
    ]).start();

    // Progress bar grows to target width (layout prop — no native driver)
    Animated.timing(progressFill, {
      toValue: step / totalSteps,
      duration: 500,
      delay: 60,
      easing: Easing.out(Easing.back(1.1)),
      useNativeDriver: false,
    }).start();

    // Title fade-up
    Animated.parallel([
      Animated.timing(titleOpacity, { toValue: 1, delay: 50,  duration: 380, useNativeDriver: true }),
      Animated.timing(titleY,       { toValue: 0, delay: 50,  duration: 380, easing: ease, useNativeDriver: true }),
    ]).start();

    // Subtitle fade-up
    Animated.parallel([
      Animated.timing(subtitleOpacity, { toValue: 1, delay: 110, duration: 360, useNativeDriver: true }),
      Animated.timing(subtitleY,       { toValue: 0, delay: 110, duration: 360, easing: ease, useNativeDriver: true }),
    ]).start();

    // Footer spring-pop
    Animated.parallel([
      Animated.timing(footerOpacity, { toValue: 1, delay: 180, duration: 300, useNativeDriver: true }),
      Animated.timing(footerY,       { toValue: 0, delay: 180, duration: 300, easing: ease, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(180),
        Animated.spring(footerScale, {
          toValue: 1,
          damping: 12,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressWidthInterp = progressFill.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.root, { backgroundColor: C.page }]}>
      {/* Background decoration — clipped to screen bounds */}
      <View style={styles.orbLayer} pointerEvents="none">
        <View style={[styles.orb, styles.orb1]} />
        <View style={[styles.orb, styles.orb2]} />
        <View style={[styles.orb, styles.orb3]} />
      </View>

      {/* Top bar: back button + step label + progress */}
      <Animated.View
        style={[styles.topBar, { paddingTop: insets.top + 8, opacity: topBarOpacity, transform: [{ translateY: topBarY }] }]}
      >
        <View style={styles.topRow}>
          {onBack ? (
            <Pressable style={styles.backBtn} onPress={onBack} hitSlop={12}>
              <Ionicons name="arrow-back" size={20} color={C.charcoal} />
            </Pressable>
          ) : (
            <View style={styles.backBtnPlaceholder} />
          )}
          <Text style={styles.stepLabel}>Step {step} of {totalSteps}</Text>
          <View style={styles.backBtnPlaceholder} />
        </View>

        {/* Animated progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFillView, { width: progressWidthInterp }]} />
        </View>
      </Animated.View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header: title + subtitle animate independently */}
        <View style={styles.header}>
          <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleY }] }}>
            <Text style={styles.title}>{title}</Text>
          </Animated.View>
          <Animated.View style={{ opacity: subtitleOpacity, transform: [{ translateY: subtitleY }] }}>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </Animated.View>
        </View>

        {children}
      </ScrollView>

      {/* Continue button — spring-pops from below */}
      <Animated.View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + 16 },
          { opacity: footerOpacity, transform: [{ translateY: footerY }, { scale: footerScale }] },
        ]}
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
          <Text style={styles.continueTxt}>
            {isLoading ? 'Saving…' : continueLabel}
          </Text>
          {!isLoading && (
            <Ionicons name="arrow-forward" size={18} color={C.white} style={{ marginLeft: 6 }} />
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },

  orbLayer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  orb: { position: 'absolute', borderRadius: 999 },
  orb1: { width: 260, height: 260, top: -80,  right: -60,  backgroundColor: 'rgba(114,47,55,0.09)' },
  orb2: { width: 180, height: 180, bottom: 120, left: -60,  backgroundColor: 'rgba(157,171,155,0.14)' },
  orb3: { width: 130, height: 130, top: 200,  left: -40,   backgroundColor: 'rgba(125,155,118,0.10)' },

  topBar: { paddingHorizontal: 20, paddingBottom: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  backBtn: {
    width: 36, height: 36, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center', justifyContent: 'center',
  },
  backBtnPlaceholder: { width: 36 },
  stepLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(45,45,45,0.55)' },

  progressTrack: { height: 4, borderRadius: 999, backgroundColor: 'rgba(45,45,45,0.12)', overflow: 'hidden' },
  progressFillView: { height: '100%', borderRadius: 999, backgroundColor: '#722F37' },

  scroll: { paddingHorizontal: 20, paddingTop: 8 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#2D2D2D', letterSpacing: -0.5, lineHeight: 34, marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22, fontWeight: '400', color: 'rgba(45,45,45,0.65)' },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingTop: 12,
    backgroundColor: 'rgba(229,224,229,0.92)',
    borderTopWidth: 1, borderTopColor: 'rgba(45,45,45,0.08)',
  },
  continueBtn: {
    backgroundColor: '#722F37', borderRadius: 999,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#722F37', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28, shadowRadius: 12, elevation: 6,
  },
  continueBtnDisabled: { opacity: 0.4, shadowOpacity: 0 },
  continueBtnPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  continueTxt: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
