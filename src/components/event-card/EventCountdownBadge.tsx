import { StyleSheet, View } from 'react-native';
import { getOverlayShadowStyle } from '../../styles/overlayShadow';
import { Text } from '../Typography';
import type { EventCountdownState } from './eventCardUtils';

type Props = {
  countdown: EventCountdownState;
};

function getCountdownLabel(countdown: EventCountdownState) {
  const parts: string[] = [];

  if (countdown.days > 0) {
    parts.push(`${countdown.days}d`);
  }
  if (countdown.days > 0 || countdown.hours > 0) {
    parts.push(`${countdown.hours}h`);
  }
  parts.push(`${countdown.minutes}m`);

  return parts.join(' ');
}

export function EventCountdownBadge({ countdown }: Props) {
  if (!countdown.show) {
    return null;
  }

  return (
    <View style={[styles.badge, getOverlayShadowStyle(999)]} pointerEvents="none">
      <Text style={styles.label}>{getCountdownLabel(countdown)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    left: 14,
    bottom: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(247, 250, 252, 0.94)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2D3748',
    letterSpacing: 0.2,
  },
});
