import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../components/Typography';
import { C, GRID } from '../constants';
import { GradientActionButton } from './GradientActionButton';

const STEPS = [
  'Check your inbox (and spam folder)',
  'Click the reset link in the email',
  'Create a new password',
];

type Props = {
  onBackToLogin: () => void;
  onUseDifferentEmail: () => void;
};

export function ForgotPasswordSuccessContent({ onBackToLogin, onUseDifferentEmail }: Props) {
  return (
    <>
      <View style={styles.successIconWrap}>
        <View style={styles.successCircle}>
          <Ionicons name="mail-outline" size={38} color={C.charcoal} />
        </View>
      </View>

      <View style={styles.nextStepsCard}>
        <Text style={styles.nextStepsTitle}>Next steps</Text>
        {STEPS.map((step, index) => (
          <View key={step} style={styles.nextStepRow}>
            <View style={styles.nextStepNum}>
              <Text style={styles.nextStepNumTxt}>{index + 1}</Text>
            </View>
            <Text style={styles.nextStepTxt}>{step}</Text>
          </View>
        ))}
        <Text style={styles.expiryNote}>Reset link expires in 60 minutes.</Text>
      </View>

      <GradientActionButton label="Back to Login" onPress={onBackToLogin} />

      <Pressable style={styles.differentEmailBtn} onPress={onUseDifferentEmail}>
        <Text style={styles.differentEmailTxt}>Use a different email</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  successIconWrap: {
    alignItems: 'center',
    marginBottom: GRID * 2,
  },
  successCircle: {
    width: 84,
    height: 84,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStepsCard: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.36)',
    borderRadius: 12,
    paddingHorizontal: GRID * 1.5,
    paddingVertical: GRID * 1.5,
    marginBottom: GRID * 2,
    gap: GRID,
  },
  nextStepsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.93)',
    marginBottom: GRID * 0.5,
  },
  nextStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: GRID * 1.25,
  },
  nextStepNum: {
    width: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  nextStepNumTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: C.white,
  },
  nextStepTxt: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.88)',
    fontWeight: '400',
  },
  expiryNote: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: GRID * 0.5,
    fontWeight: '400',
  },
  differentEmailBtn: {
    alignItems: 'center',
    paddingVertical: GRID * 1.5,
    marginTop: GRID,
  },
  differentEmailTxt: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
});
