import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Typography';
import { haptics } from '../lib/haptics';
import { NAVBAR_BG_COLOR } from '../styles/colors';

type Props = {
  visible: boolean;
  /** Contextual message, e.g. "Log in to save The Test Kitchen" */
  message: string;
  onLogin: () => void;
  onRegister: () => void;
  onDismiss: () => void;
};

export function AuthGateSheet({ visible, message, onLogin, onRegister, onDismiss }: Props) {
  const handleLogin = () => {
    haptics.confirm();
    onLogin();
  };

  const handleRegister = () => {
    haptics.navigation();
    onRegister();
  };

  const handleDismiss = () => {
    haptics.navigation();
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleDismiss}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.iconCircle}>
            <Ionicons name="person-outline" size={28} color={NAVBAR_BG_COLOR} />
          </View>

          <Text style={styles.message}>{message}</Text>
          <Text style={styles.subtitle}>Join Sayso to unlock this and more.</Text>

          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            onPress={handleLogin}
            accessibilityRole="button"
            accessibilityLabel="Log in"
          >
            <Text style={styles.primaryBtnText}>Log in</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            onPress={handleRegister}
            accessibilityRole="button"
            accessibilityLabel="Create account"
          >
            <Text style={styles.secondaryBtnText}>Create account</Text>
          </Pressable>

          <Pressable
            onPress={handleDismiss}
            accessibilityRole="button"
            accessibilityLabel="Maybe later"
          >
            <Text style={styles.dismissLink}>Maybe later</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#E5E0E5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(114,47,55,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  message: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D2D2D',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(45,45,45,0.60)',
    textAlign: 'center',
    lineHeight: 20,
  },
  primaryBtn: {
    marginTop: 8,
    width: '100%',
    backgroundColor: NAVBAR_BG_COLOR,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    width: '100%',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.60)',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D2D2D',
  },
  dismissLink: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(45,45,45,0.50)',
    marginTop: 4,
  },
  pressed: { opacity: 0.8 },
});
