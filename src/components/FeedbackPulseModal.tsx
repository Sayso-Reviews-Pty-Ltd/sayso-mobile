import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { haptics } from '../lib/haptics';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Context label shown to the user, e.g. "Writing reviews" or "Finding places" */
  context: string;
  /** Called with true (positive) or false (negative) when user responds */
  onRespond: (positive: boolean) => void;
};

export function FeedbackPulseModal({ visible, onClose, context, onRespond }: Props) {
  const handleRespond = (positive: boolean) => {
    positive ? haptics.complete() : haptics.navigation();
    onRespond(positive); // caller (useFeedbackPulse) owns tracking
    onClose();
  };

  const handleSkip = () => { haptics.navigation(); onClose(); };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleSkip}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.eyebrow}>QUICK FEEDBACK</Text>
          <Text style={styles.question}>Are you enjoying {context}?</Text>

          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [styles.choiceBtn, styles.positiveBtn, pressed && styles.pressed]}
              onPress={() => handleRespond(true)}
            >
              <Text style={styles.emoji}>👍</Text>
              <Text style={styles.choiceLabel}>Yes, loving it</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.choiceBtn, styles.negativeBtn, pressed && styles.pressed]}
              onPress={() => handleRespond(false)}
            >
              <Text style={styles.emoji}>👎</Text>
              <Text style={styles.choiceLabel}>Not really</Text>
            </Pressable>
          </View>

          <Pressable onPress={handleSkip}>
            <Text style={styles.skipLink}>Skip</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  eyebrow: { fontSize: 11, letterSpacing: 0.5, color: 'rgba(45,45,45,0.45)', textTransform: 'uppercase' },
  question: { fontSize: 17, fontWeight: '700', color: '#2D2D2D', marginTop: 8 },
  buttonRow: { flexDirection: 'row', gap: 16, marginTop: 20 },
  choiceBtn: { flex: 1, paddingVertical: 16, alignItems: 'center', borderRadius: 16, borderWidth: 1 },
  positiveBtn: { backgroundColor: 'rgba(125,155,118,0.12)', borderColor: 'rgba(125,155,118,0.30)' },
  negativeBtn: { backgroundColor: 'rgba(45,45,45,0.06)', borderColor: 'rgba(45,45,45,0.12)' },
  emoji: { fontSize: 28 },
  choiceLabel: { fontSize: 12, fontWeight: '600', color: '#2D2D2D', marginTop: 4 },
  skipLink: { fontSize: 12, color: 'rgba(45,45,45,0.45)', textAlign: 'center', marginTop: 16 },
  pressed: { opacity: 0.75 },
});
