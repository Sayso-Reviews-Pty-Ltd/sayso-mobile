import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/Typography';
import { C, GRID } from './constants';
import { styles } from './styles';
import type { ReviewerProfile } from './types';

function StatCard({
  icon,
  label,
  value,
  delay,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  delay: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(GRID * 1.5)).current;

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 280, easing: ease, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 280, easing: ease, useNativeDriver: true }),
      ]),
    ]).start();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View style={[styles.statCard, { opacity, transform: [{ translateY }] }]}>
      <View style={styles.statIconWrap}>
        <Ionicons name={icon} size={16} color={C.charcoal60} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </Animated.View>
  );
}

type Props = {
  contentOpacity: Animated.Value;
  contentY: Animated.Value;
  reviewer: ReviewerProfile;
};

export function ReviewerStatsSection({ contentOpacity, contentY, reviewer }: Props) {
  return (
    <Animated.View style={[styles.statsGrid, { opacity: contentOpacity, transform: [{ translateY: contentY }] }]}>
      <StatCard icon="thumbs-up-outline" label="Helpful" value={reviewer.helpfulVotes.toLocaleString('en-US')} delay={0} />
      <StatCard icon="ribbon-outline" label="Badges" value={reviewer.badgesCount.toLocaleString('en-US')} delay={60} />
      <StatCard icon="trending-up-outline" label="Impact" value={reviewer.impactScore.toLocaleString('en-US')} delay={120} />
      <StatCard icon="star-outline" label="Rating" value={reviewer.averageRating.toFixed(1)} delay={180} />
    </Animated.View>
  );
}
