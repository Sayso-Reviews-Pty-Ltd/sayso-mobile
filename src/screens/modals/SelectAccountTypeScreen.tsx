import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { routes } from '../../navigation/routes';
import { Text } from '../../components/Typography';
import { Button } from '../../components/ui/button';
import { ONBOARDING_TOKENS } from '../../components/onboarding/onboardingTheme';

const GRID = 8;
const MAX_RAIL_WIDTH = 420;

type ButtonDef = {
  label: string;
  route: string;
  bg: string;
  textColor: string;
};

const BUTTONS: ButtonDef[] = [
  {
    label: 'Log in',
    route: routes.login(),
    bg: ONBOARDING_TOKENS.cardBg,
    textColor: ONBOARDING_TOKENS.white,
  },
  {
    label: 'Create account',
    route: routes.register(),
    bg: ONBOARDING_TOKENS.charcoal,
    textColor: ONBOARDING_TOKENS.white,
  },
];

export default function SelectAccountTypeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(GRID * 2);
  const cardOpacity = useSharedValue(0);
  const cardY = useSharedValue(GRID * 2.5);

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);
    titleOpacity.value = withTiming(1, { duration: 260, easing: ease });
    titleY.value = withTiming(0, { duration: 260, easing: ease });
    cardOpacity.value = withDelay(70, withTiming(1, { duration: 280, easing: ease }));
    cardY.value = withDelay(70, withTiming(0, { duration: 280, easing: ease }));
  }, []);

  const titleAnimStyle = useAnimatedStyle(
    () => ({
      opacity: titleOpacity.value,
      transform: [{ translateY: titleY.value }],
    }),
    [],
  );

  const cardAnimStyle = useAnimatedStyle(
    () => ({
      opacity: cardOpacity.value,
      transform: [{ translateY: cardY.value }],
    }),
    [],
  );

  return (
    <View style={[styles.root, { backgroundColor: ONBOARDING_TOKENS.offWhite }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.backBtnWrap, { top: insets.top + GRID * 1.5 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back-outline" size={22} color={ONBOARDING_TOKENS.charcoal} />
        </Pressable>
      </View>

      <View
        style={[
          styles.content,
          { paddingTop: insets.top + GRID * 9, paddingBottom: insets.bottom + GRID * 4 },
        ]}
      >
        <View style={styles.rail}>
          <Animated.View style={titleAnimStyle}>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>Welcome!</Text>
              <Text style={styles.subtitle}>Please choose an option to get started.</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.cardWrap, cardAnimStyle]}>
            <LinearGradient
              colors={[
                ONBOARDING_TOKENS.cardBg,
                ONBOARDING_TOKENS.cardBg,
                'rgba(157,171,155,0.95)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <View style={styles.buttonGroup}>
                {BUTTONS.map((btn) => (
                  <Button
                    key={btn.label}
                    variant="onboarding-solid"
                    style={{ backgroundColor: btn.bg }}
                    textStyle={{ color: btn.textColor }}
                    onPress={() => router.replace(btn.route as never)}
                  >
                    {btn.label}
                  </Button>
                ))}
              </View>

              <View style={styles.noteRow}>
                <Text style={styles.noteText}>
                  Business accounts are managed on{' '}
                  <Text style={styles.noteEmphasis}>sayso.com</Text>
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: GRID * 2,
    alignItems: 'center',
  },
  rail: {
    width: '100%',
    maxWidth: MAX_RAIL_WIDTH,
    gap: GRID * 3,
  },
  backBtnWrap: {
    position: 'absolute',
    left: GRID * 2,
    zIndex: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(45,45,45,0.08)',
  },
  titleBlock: {
    alignItems: 'center',
    gap: GRID,
    paddingHorizontal: GRID,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    color: ONBOARDING_TOKENS.charcoal,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: ONBOARDING_TOKENS.charcoal70,
    textAlign: 'center',
    fontWeight: '400',
  },
  cardWrap: {
    width: '100%',
  },
  card: {
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: GRID * 2,
    paddingVertical: GRID * 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    gap: GRID * 2,
  },
  buttonGroup: {
    gap: GRID * 2,
  },
  noteRow: {
    alignItems: 'center',
    paddingTop: GRID,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  noteText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 18,
  },
  noteEmphasis: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
