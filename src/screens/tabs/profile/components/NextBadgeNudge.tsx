import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { SkeletonBlock } from '../../../../components/SkeletonBlock';
import { Text } from '../../../../components/Typography';
import { useNextBadgeProgress, type BadgeProgressItem } from '../../../../hooks/useNextBadgeProgress';
import { CHARCOAL, CORAL } from '../constants';

type RowProps = {
  badge: BadgeProgressItem;
  index: number;
};

function BadgeProgressRow({ badge, index }: RowProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const target = badge.percent > 0 ? Math.max(badge.percent, 6) : 0;
    const delayMs = index * 60;
    const timeout = setTimeout(() => {
      Animated.timing(widthAnim, {
        toValue: target,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }, delayMs);
    return () => clearTimeout(timeout);
  }, [badge.percent, index, widthAnim]);

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        {badge.iconPath ? (
          <Image source={{ uri: badge.iconPath }} style={styles.icon} contentFit="contain" />
        ) : null}
      </View>

      <View style={styles.info}>
        <Text style={styles.label} numberOfLines={2}>
          <Text style={styles.bold}>{badge.remaining}</Text>
          {' '}more {badge.actionLabel} to unlock{' '}
          <Text style={styles.badgeName}>{badge.name}</Text>
        </Text>

        <View style={styles.track}>
          <Animated.View style={[styles.fill, { width: animatedWidth }]} />
        </View>

        <Text style={styles.stat}>{badge.current} / {badge.required}</Text>
      </View>
    </View>
  );
}

export function NextBadgeNudge() {
  const { nearestBadges, isLoading } = useNextBadgeProgress();

  if (isLoading) {
    return (
      <View style={styles.container}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.skeletonRow}>
            <SkeletonBlock style={styles.skeletonIcon} />
            <View style={styles.skeletonInfo}>
              <SkeletonBlock style={styles.skeletonLine} />
              <SkeletonBlock style={styles.skeletonBar} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (nearestBadges.length === 0) return null;

  return (
    <View style={styles.container}>
      {nearestBadges.map((badge, idx) => (
        <BadgeProgressRow key={badge.badgeId} badge={badge} index={idx} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(45,45,45,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    opacity: 0.55,
    flexShrink: 0,
  },
  icon: {
    width: 28,
    height: 28,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: CHARCOAL,
    lineHeight: 17,
  },
  bold: {
    fontWeight: '700',
    color: CHARCOAL,
  },
  badgeName: {
    fontWeight: '700',
    color: CORAL,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(45,45,45,0.1)',
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: CORAL,
  },
  stat: {
    fontSize: 10,
    color: 'rgba(45,45,45,0.5)',
    fontWeight: '500',
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skeletonIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  skeletonInfo: {
    flex: 1,
    gap: 6,
  },
  skeletonLine: {
    height: 12,
    width: '60%',
    borderRadius: 6,
  },
  skeletonBar: {
    height: 8,
    width: '100%',
    borderRadius: 4,
  },
});
