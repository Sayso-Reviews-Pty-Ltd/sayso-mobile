import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { routes } from '../../navigation/routes';
import { Text } from '../../components/Typography';

const GRID = 8;
const MAX_RAIL_WIDTH = 420;

const C = {
  page: '#E5E0E5',
  card: '#9DAB9B',
  charcoal: '#2D2D2D',
  charcoal70: 'rgba(45,45,45,0.7)',
  white: '#FFFFFF',
  wine: '#722F37',
  sage: '#7D9B76',
};

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
    bg: C.card,
    textColor: C.white,
  },
  {
    label: 'Create account',
    route: routes.register(),
    bg: C.charcoal,
    textColor: C.white,
  },
];

export default function SelectAccountTypeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(GRID * 2)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(GRID * 2.5)).current;

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);
    Animated.parallel([
      Animated.timing(titleOpacity, { toValue: 1, duration: 260, easing: ease, useNativeDriver: true }),
      Animated.timing(titleY, { toValue: 0, duration: 260, easing: ease, useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.delay(70),
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 280, easing: ease, useNativeDriver: true }),
        Animated.timing(cardY, { toValue: 0, duration: 280, easing: ease, useNativeDriver: true }),
      ]),
    ]).start();
  }, [cardOpacity, cardY, titleOpacity, titleY]);

  return (
    <View style={[styles.root, { backgroundColor: C.page }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.backBtnWrap, { top: insets.top + GRID * 1.5 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={C.charcoal} />
        </Pressable>
      </View>

      <View
        style={[
          styles.content,
          { paddingTop: insets.top + GRID * 9, paddingBottom: insets.bottom + GRID * 4 },
        ]}
      >
        <View style={styles.rail}>
          <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleY }] }}>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>Welcome!</Text>
              <Text style={styles.subtitle}>Please choose an option to get started.</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.cardWrap, { opacity: cardOpacity, transform: [{ translateY: cardY }] }]}>
            <LinearGradient
              colors={[C.card, C.card, 'rgba(157,171,155,0.95)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <View style={styles.buttonGroup}>
                {BUTTONS.map((btn) => (
                  <Pressable
                    key={btn.label}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      { backgroundColor: btn.bg },
                      pressed ? styles.actionBtnPressed : null,
                    ]}
                    onPress={() => router.replace(btn.route as never)}
                  >
                    <Text style={[styles.actionBtnText, { color: btn.textColor }]}>{btn.label}</Text>
                  </Pressable>
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
    color: C.charcoal,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: C.charcoal70,
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
  actionBtn: {
    borderRadius: 999,
    minHeight: GRID * 7,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionBtnPressed: {
    opacity: 0.88,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '600',
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
