import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { Text } from '../Typography';

type Props = {
  onPress: () => void;
  disabled?: boolean;
  label?: string;
  style?: ViewStyle;
};

export function LoadMoreButton({ onPress, disabled = false, label = 'Load More', style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
        style,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 16,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(114, 47, 55, 0.18)',
    backgroundColor: 'rgba(114, 47, 55, 0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#722F37',
  },
});
