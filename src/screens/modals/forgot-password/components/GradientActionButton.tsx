import { Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../../components/Typography';
import { C, GRID } from '../constants';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  pressedEnabled?: boolean;
};

export function GradientActionButton({
  label,
  onPress,
  disabled = false,
  pressedEnabled = true,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.submitBtn,
        disabled ? styles.submitBtnDisabled : null,
        pressed && pressedEnabled && !disabled ? styles.submitBtnPressed : null,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <LinearGradient
        colors={[C.wine, 'rgba(114,47,55,0.8)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.submitBtnGradient}
      >
        <Text style={styles.submitTxt}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  submitBtn: {
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: C.wine,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  submitBtnGradient: {
    minHeight: GRID * 7,
    paddingVertical: GRID * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  submitBtnDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  submitTxt: {
    fontSize: 16,
    fontWeight: '600',
    color: C.white,
  },
});
