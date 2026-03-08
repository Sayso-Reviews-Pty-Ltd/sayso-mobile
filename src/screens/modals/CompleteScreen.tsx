import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/Typography';
import { apiFetch } from '../../lib/api';
import { routes } from '../../navigation/routes';

// Confetti particle — a single animated colored dot
function Particle({ delay, x, color, size }: { delay: number; x: number; color: string; size: number }) {
  const y = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(y, { toValue: 600, duration: 1800, useNativeDriver: true }),
        Animated.timing(rotation, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]);
    anim.start();
  }, [delay, opacity, y, rotation]);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: x,
        width: size,
        height: size,
        borderRadius: size / 4,
        backgroundColor: color,
        opacity,
        transform: [{ translateY: y }, { rotate: spin }],
      }}
      pointerEvents="none"
    />
  );
}

const CONFETTI_COLORS = ['#722F37', '#9DAB9B', '#E5E0E5', '#7D9B76', '#D4A5A5', '#B8C9B6'];
const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  key: i,
  delay: Math.random() * 800,
  x: Math.random() * 340,
  color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
  size: 6 + Math.random() * 8,
}));

export default function CompleteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Entrance animations
  const checkScale   = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity  = useRef(new Animated.Value(0)).current;
  const textY        = useRef(new Animated.Value(20)).current;
  const btnOpacity   = useRef(new Animated.Value(0)).current;
  const btnY         = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    // Fire completion API (best-effort)
    apiFetch('/api/onboarding/complete', { method: 'POST' }).then(() => {
      AsyncStorage.multiRemove([
        'onboarding_interests',
        'onboarding_subcategories',
        'onboarding_dealbreakers',
      ]);
    }).catch(() => {/* ignore */});

    // Staggered entrance
    Animated.sequence([
      Animated.parallel([
        Animated.timing(checkOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(checkScale, { toValue: 1, damping: 10, stiffness: 200, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, delay: 100, duration: 360, useNativeDriver: true }),
        Animated.timing(textY, { toValue: 0, delay: 100, duration: 360, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(btnOpacity, { toValue: 1, delay: 60, duration: 320, useNativeDriver: true }),
        Animated.timing(btnY, { toValue: 0, delay: 60, duration: 320, useNativeDriver: true }),
      ]),
    ]).start();

    // Auto-redirect after 3s
    const timer = setTimeout(() => {
      router.replace(routes.home() as never);
    }, 3000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = () => router.replace(routes.home() as never);

  return (
    <View style={[styles.root, { backgroundColor: '#E5E0E5' }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Confetti particles */}
      <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]} pointerEvents="none">
        {PARTICLES.map(p => (
          <Particle key={p.key} delay={p.delay} x={p.x} color={p.color} size={p.size} />
        ))}
      </View>

      {/* Background decoration — clipped to screen bounds */}
      <View style={styles.orbLayer} pointerEvents="none">
        <View style={[styles.orb, styles.orb1]} />
        <View style={[styles.orb, styles.orb2]} />
      </View>

      <View style={[styles.content, { paddingTop: insets.top + 40, paddingBottom: 24 }]}>

        {/* Animated checkmark circle */}
        <Animated.View style={[styles.checkCircle, { opacity: checkOpacity, transform: [{ scale: checkScale }] }]}>
          <Ionicons name="checkmark" size={52} color="#FFFFFF" />
        </Animated.View>

        {/* Text block */}
        <Animated.View style={[styles.textBlock, { opacity: textOpacity, transform: [{ translateY: textY }] }]}>
          {/* Badge */}
          <View style={styles.badge}>
            <Ionicons name="ribbon-outline" size={14} color="#7D9B76" />
            <Text style={styles.badgeText}>Setup Complete</Text>
          </View>

          <Text style={styles.heading}>You're all set!</Text>
          <Text style={styles.subheading}>Time to discover what's out there.</Text>
        </Animated.View>

        {/* CTA button */}
        <Animated.View style={[styles.btnWrap, { opacity: btnOpacity, transform: [{ translateY: btnY }] }]}>
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            onPress={handleContinue}
          >
            <Text style={styles.btnTxt}>Continue to Home</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </Pressable>
          <Text style={styles.autoRedirectHint}>Redirecting automatically…</Text>
        </Animated.View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  orbLayer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  orb: { position: 'absolute', borderRadius: 999 },
  orb1: { width: 300, height: 300, top: -100, right: -80, backgroundColor: 'rgba(114,47,55,0.09)' },
  orb2: { width: 200, height: 200, bottom: 60, left: -60, backgroundColor: 'rgba(157,171,155,0.14)' },

  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, gap: 32,
  },

  checkCircle: {
    width: 100, height: 100, borderRadius: 999,
    backgroundColor: '#7D9B76',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#7D9B76', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35, shadowRadius: 20, elevation: 12,
  },

  textBlock: { alignItems: 'center', gap: 12 },

  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(125,155,118,0.15)',
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(125,155,118,0.35)',
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#7D9B76' },

  heading: {
    fontSize: 36, fontWeight: '700', color: '#2D2D2D',
    textAlign: 'center', letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 16, lineHeight: 24, fontWeight: '400',
    color: 'rgba(45,45,45,0.65)', textAlign: 'center',
  },

  btnWrap: { alignItems: 'center', gap: 12 },

  btn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#722F37', borderRadius: 999,
    paddingVertical: 16, paddingHorizontal: 32,
    shadowColor: '#722F37', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28, shadowRadius: 12, elevation: 6,
  },
  btnPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  btnTxt: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  autoRedirectHint: {
    fontSize: 12, fontWeight: '400',
    color: 'rgba(45,45,45,0.45)', textAlign: 'center',
  },
});
