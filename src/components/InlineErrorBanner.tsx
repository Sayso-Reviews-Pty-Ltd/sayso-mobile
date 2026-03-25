import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Typography';

type Props = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function InlineErrorBanner({ message, actionLabel, onAction }: Props) {
  return (
    <View style={styles.banner} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Ionicons name="alert-circle-outline" size={16} color="#722F37" />
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={styles.action}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(114,47,55,0.30)',
    backgroundColor: 'rgba(229,224,229,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  message: {
    flex: 1,
    color: '#722F37',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  action: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#722F37',
    textDecorationLine: 'underline',
  },
});
