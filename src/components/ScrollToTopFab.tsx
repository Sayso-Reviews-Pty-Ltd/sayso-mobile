import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type Props = {
  visible: boolean;
  onPress: () => void;
};

export function ScrollToTopFab({ visible, onPress }: Props) {
  const anim = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    anim.value = withSpring(visible ? 1 : 0, {
      damping: 18,
      stiffness: 260,
    });
  }, [visible, anim]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: anim.value,
    transform: [{ scale: 0.7 + 0.3 * anim.value }],
  }), []);

  return (
    <Animated.View
      style={[styles.fab, animatedStyle]}
      pointerEvents={visible ? 'box-none' : 'none'}
    >
      <Pressable
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        onPress={() => {
          try { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
          onPress();
        }}
        accessibilityRole="button"
        accessibilityLabel="Scroll to top"
      >
        <Ionicons name="chevron-up-outline" size={20} color="#2D2D2D" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 32,
    zIndex: 100,
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: 'rgba(229,224,229,0.90)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.95 }],
  },
});
