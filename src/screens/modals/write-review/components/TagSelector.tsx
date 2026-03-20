import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../components/Typography';
import { useReducedMotion } from '../../../../hooks/useReducedMotion';
import { C } from '../constants';

type Props = {
  tags: string[];
  selected: string[];
  onToggle: (tag: string) => void;
  disabled?: boolean;
};

export function TagSelector({ tags, selected, onToggle, disabled }: Props) {
  const reducedMotion = useReducedMotion();
  const maxReached = selected.length >= 4;

  const tagAnimsRef = useRef(
    new Map<
      string,
      {
        opacity: Animated.Value;
        scale: Animated.Value;
        iconScale: Animated.Value;
        iconRotate: Animated.Value;
      }
    >()
  ).current;

  const getTagAnim = (tag: string) => {
    if (!tagAnimsRef.has(tag)) {
      tagAnimsRef.set(tag, {
        opacity: new Animated.Value(0),
        scale: new Animated.Value(0.8),
        iconScale: new Animated.Value(1),
        iconRotate: new Animated.Value(0),
      });
    }
    return tagAnimsRef.get(tag)!;
  };

  useEffect(() => {
    const anims = tags
      .map((tag, index) => {
        const anim = getTagAnim(tag);
        if (reducedMotion) {
          anim.opacity.setValue(1);
          anim.scale.setValue(1);
          return null;
        }
        anim.opacity.setValue(0);
        anim.scale.setValue(0.8);
        return Animated.sequence([
          Animated.delay(index * 30),
          Animated.parallel([
            Animated.timing(anim.opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.timing(anim.scale, { toValue: 1, duration: 200, useNativeDriver: true }),
          ]),
        ]);
      })
      .filter(Boolean) as Animated.CompositeAnimation[];
    if (anims.length) Animated.parallel(anims).start();
  }, [reducedMotion, tags]);

  const handleToggle = (tag: string) => {
    const isOn = selected.includes(tag);
    if (disabled || (!isOn && maxReached)) return;
    const anim = getTagAnim(tag);
    if (!reducedMotion) {
      Animated.timing(anim.iconScale, { toValue: 0, duration: 80, useNativeDriver: true }).start(() => {
        onToggle(tag);
        const willBeOn = !isOn;
        anim.iconRotate.setValue(willBeOn ? -180 : 0);
        Animated.parallel([
          Animated.timing(anim.iconScale, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.timing(anim.iconRotate, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]).start();
      });
    } else {
      onToggle(tag);
    }
  };

  const removeHintOpacity = useRef(new Animated.Value(0)).current;
  const removeHintTranslateY = useRef(new Animated.Value(-8)).current;
  const wasMaxReached = useRef(false);

  useEffect(() => {
    if (maxReached && !wasMaxReached.current) {
      wasMaxReached.current = true;
      if (reducedMotion) {
        removeHintOpacity.setValue(1);
        removeHintTranslateY.setValue(0);
      } else {
        removeHintOpacity.setValue(0);
        removeHintTranslateY.setValue(-8);
        Animated.parallel([
          Animated.timing(removeHintOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(removeHintTranslateY, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start();
      }
    } else if (!maxReached) {
      wasMaxReached.current = false;
      removeHintOpacity.setValue(0);
      removeHintTranslateY.setValue(-8);
    }
  }, [maxReached, reducedMotion, removeHintOpacity, removeHintTranslateY]);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="sparkles-outline" size={16} color={C.coral} style={{ opacity: 0.8 }} />
          <Text style={styles.heading}>Quick tags</Text>
        </View>
        <View style={[styles.counterPill, selected.length > 0 && styles.counterPillActive]}>
          <Text style={[styles.counterText, selected.length > 0 && styles.counterTextActive]}>
            {selected.length}/4 selected
          </Text>
        </View>
      </View>
      <View style={styles.wrap}>
        {tags.map((tag) => {
          const isOn = selected.includes(tag);
          const isDisabled = disabled || (!isOn && maxReached);
          const anim = getTagAnim(tag);
          return (
            <Animated.View key={tag} style={{ opacity: anim.opacity, transform: [{ scale: anim.scale }] }}>
              <Pressable
                onPress={() => handleToggle(tag)}
                style={[styles.pill, isOn && styles.pillOn, isDisabled && !isOn && styles.pillDim]}
              >
                <Animated.View
                  style={{
                    transform: [
                      { scale: anim.iconScale },
                      {
                        rotate: anim.iconRotate.interpolate({
                          inputRange: [-180, 0],
                          outputRange: ['-180deg', '0deg'],
                        }),
                      },
                    ],
                  }}
                >
                  <Ionicons
                    name={isOn ? 'checkmark' : 'add'}
                    size={13}
                    color={isOn ? C.coral : isDisabled ? C.charcoal30 : C.charcoal60}
                    style={{ opacity: isOn ? 1 : 0.6 }}
                  />
                </Animated.View>
                <Text style={[styles.pillText, isOn && styles.pillTextOn, isDisabled && !isOn && styles.pillTextDim]}>
                  {tag}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
      {maxReached ? (
        <Animated.Text style={[styles.removeHint, { opacity: removeHintOpacity, transform: [{ translateY: removeHintTranslateY }] }]}>
          Tap a selected tag to remove it
        </Animated.Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heading: { fontSize: 16, fontWeight: '600', color: C.charcoal },
  counterPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: C.charcoal10 },
  counterPillActive: { backgroundColor: 'rgba(114,47,55,0.15)' },
  counterText: { fontSize: 13, color: C.charcoal60 },
  counterTextActive: { color: C.coral },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: C.charcoal10,
    borderWidth: 2,
    borderColor: 'rgba(45,45,45,0.20)',
  },
  pillOn: { backgroundColor: 'rgba(114,47,55,0.20)', borderColor: C.coral },
  pillDim: { opacity: 0.4 },
  pillText: { fontSize: 14, fontWeight: '600', color: 'rgba(45,45,45,0.70)' },
  pillTextOn: { color: C.charcoal },
  pillTextDim: { color: C.charcoal30 },
  removeHint: { fontSize: 13, color: C.charcoal60, textAlign: 'center', marginTop: 4 },
});
