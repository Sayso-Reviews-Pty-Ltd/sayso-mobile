import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SkeletonBlock } from '../../../../components/SkeletonBlock';
import { Text } from '../../../../components/Typography';
import { useUserXP } from '../../../../hooks/useUserXP';
import { nextPerkAt } from '../../../../lib/xp/levels';
import { CHARCOAL, CORAL } from '../constants';

export function XPBar() {
  const xp = useUserXP();
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (xp.isLoading || xp.error) return;
    Animated.timing(widthAnim, {
      toValue: xp.percentToNext,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [xp.percentToNext, xp.isLoading, xp.error, widthAnim]);

  if (xp.isLoading) {
    return (
      <View style={styles.container}>
        <SkeletonBlock style={styles.skeleton} />
      </View>
    );
  }

  if (xp.error) return null;

  const perk = nextPerkAt(xp.level);

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Lv {xp.level}</Text>
        </View>

        <View style={styles.barWrap}>
          <View style={styles.track}>
            <Animated.View style={[styles.fill, { width: animatedWidth }]} />
          </View>
          <Text style={styles.xpLabel}>
            {xp.xpIntoCurrentLevel} / {xp.xpToNextLevel} XP
          </Text>
        </View>
      </View>

      {perk ? (
        <Text style={styles.perkLabel}>
          Next perk at Lv {perk.level}: {perk.perk}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  levelBadge: {
    backgroundColor: CORAL,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexShrink: 0,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 14,
  },
  barWrap: {
    flex: 1,
    gap: 3,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(45,45,45,0.12)',
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: CORAL,
  },
  xpLabel: {
    fontSize: 10,
    color: 'rgba(45,45,45,0.55)',
    fontWeight: '500',
  },
  perkLabel: {
    fontSize: 11,
    color: 'rgba(45,45,45,0.5)',
    fontStyle: 'italic',
    lineHeight: 15,
  },
  skeleton: {
    height: 24,
    borderRadius: 12,
    width: '100%',
  },
});
