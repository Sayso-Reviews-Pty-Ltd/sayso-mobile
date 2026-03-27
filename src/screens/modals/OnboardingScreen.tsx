import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { routes } from '../../navigation/routes';
import { Text } from '../../components/Typography';
import { Button } from '../../components/ui/button';

const GRID = 8;
const TYPE_SCALE = {
  logo: 26,
  title: 34,
  subtitle: 16,
  tagline: 14,
} as const;

const C = {
  page: '#E5E0E5',
  charcoal: '#2D2D2D',
  charcoalSoft: 'rgba(45,45,45,0.72)',
};

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isNavigatingRef = useRef<boolean>(false);
  // Redirect handled by RootGuard — do not re-add here.

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(GRID * 2)).current;

  const ctaScale = useRef(new Animated.Value(0.96)).current;
  const ctaY = useRef(new Animated.Value(GRID)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const easeOut = Easing.out(Easing.cubic);

    // Header enters first to establish context.
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 260,
        easing: easeOut,
        useNativeDriver: true,
      }),
      Animated.timing(headerY, {
        toValue: 0,
        duration: 260,
        easing: easeOut,
        useNativeDriver: true,
      }),
    ]).start();

    // CTA settles with a subtle spring so focus lands on primary action.
    Animated.sequence([
      Animated.delay(120),
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ctaOpacity, {
            toValue: 1,
            duration: 200,
            easing: easeOut,
            useNativeDriver: true,
          }),
          Animated.timing(ctaY, {
            toValue: 0,
            duration: 200,
            easing: easeOut,
            useNativeDriver: true,
          }),
          Animated.spring(ctaScale, {
            toValue: 1.02,
            damping: 16,
            stiffness: 220,
            mass: 0.8,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(ctaScale, {
          toValue: 1,
          damping: 22,
          stiffness: 260,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [ctaOpacity, ctaScale, ctaY, headerOpacity, headerY]);

  const handleGetStarted = () => {
    router.replace(routes.home() as never);
  };

  const handleLogIn = () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    router.push(routes.login() as never);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 300);
  };

  return (
    <View style={[styles.root, { backgroundColor: C.page }]}>
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + GRID * 3,
            paddingBottom: insets.bottom + GRID * 4,
          },
        ]}
      >
        {/* Wordmark — pinned to the top */}
        <Animated.View style={{ opacity: headerOpacity, transform: [{ translateY: headerY }] }}>
          <Text style={styles.logoText}>Sayso</Text>
        </Animated.View>

        {/* Title + subtitle — vertically centred between wordmark and CTAs */}
        <Animated.View
          style={[
            styles.headerGroup,
            {
              opacity: headerOpacity,
              transform: [{ translateY: headerY }],
            },
          ]}
        >
          <Text style={styles.title}>Discover gems{'\n'}near you!</Text>
          <Text style={styles.subtitle}>
            Explore trusted businesses, leave reviews and see what&apos;s trending around you
          </Text>
        </Animated.View>

        {/* CTAs + tagline — anchored to the bottom */}
        <View style={styles.bottomWrap}>
          <Animated.View
            style={[
              styles.ctaWrap,
              {
                opacity: ctaOpacity,
                transform: [{ translateY: ctaY }, { scale: ctaScale }],
              },
            ]}
          >
            <Button variant="onboarding-primary" onPress={handleGetStarted}>
              Get Started
            </Button>

            <View style={styles.authRow}>
              <Button variant="onboarding-gradient" onPress={handleLogIn} hitSlop={8}>
                Log In
              </Button>
            </View>
          </Animated.View>

          <Text style={styles.tagline}>Less guessing, more confessing</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  content: {
    flex: 1,
    paddingHorizontal: GRID * 3,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  bottomWrap: {
    width: '100%',
    maxWidth: GRID * 43,
    gap: GRID * 2,
    alignItems: 'center',
  },

  headerGroup: {
    width: '100%',
    alignItems: 'center',
    gap: GRID * 2,
  },

  logoText: {
    fontFamily: 'MonarchParadox',
    fontSize: TYPE_SCALE.logo,
    lineHeight: 32,
    color: C.charcoal,
    letterSpacing: 0.2,
    textTransform: 'none',
  },

  title: {
    fontSize: TYPE_SCALE.title,
    lineHeight: 40,
    fontWeight: '700',
    color: C.charcoal,
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  subtitle: {
    maxWidth: GRID * 36,
    fontSize: TYPE_SCALE.subtitle,
    lineHeight: 24,
    color: C.charcoalSoft,
    textAlign: 'center',
    fontWeight: '400',
  },

  ctaWrap: {
    width: '100%',
    gap: GRID * 1.5,
  },

  authRow: {
    width: '100%',
  },

  tagline: {
    fontSize: TYPE_SCALE.tagline,
    lineHeight: 24,
    fontStyle: 'italic',
    fontWeight: '500',
    color: 'rgba(45,45,45,0.65)',
    textAlign: 'center',
  },
});
