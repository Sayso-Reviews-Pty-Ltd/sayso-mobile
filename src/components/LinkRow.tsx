import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Typography';

type Props = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  badge?: string | number;
};

export function LinkRow({
  title,
  subtitle,
  onPress,
  icon = 'chevron-forward',
  badge,
}: Props) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.trailing}>
        {badge != null ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
        <Ionicons name={icon} size={18} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    gap: 4,
    paddingRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
  badgeText: {
    color: '#4338CA',
    fontSize: 12,
    fontWeight: '700',
  },
});
