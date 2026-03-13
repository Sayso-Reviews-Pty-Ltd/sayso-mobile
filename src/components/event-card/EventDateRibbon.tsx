import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NAVBAR_BG_90 } from '../../styles/colors';
import { getOverlayShadowStyle } from '../../styles/overlayShadow';
import { Text } from '../Typography';

type Props = {
  label: string | null;
};

export function EventDateRibbon({ label }: Props) {
  if (!label) {
    return null;
  }

  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={[styles.ribbon, getOverlayShadowStyle(18)]}>
        <Ionicons name="calendar-outline" size={12} color="#FFFFFF" />
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 12,
    top: 12,
  },
  ribbon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: NAVBAR_BG_90,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
