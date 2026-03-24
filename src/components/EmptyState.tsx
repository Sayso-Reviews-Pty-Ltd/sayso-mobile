import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Typography';
import { haptics } from '../lib/haptics';
import { NAVBAR_BG_COLOR } from '../styles/colors';

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon = 'search', title, message, actionLabel, onAction }: Props) {
  function handleAction() {
    haptics.navigation();
    onAction?.();
  }

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={52} color="rgba(45,45,45,0.25)" />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.button} onPress={handleAction} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D2D2D',
    marginTop: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(45,45,45,0.60)',
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    backgroundColor: NAVBAR_BG_COLOR,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
