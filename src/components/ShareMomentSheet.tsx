import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Typography';
import { haptics } from '../lib/haptics';
import { track } from '../lib/telemetry';

type Moment = { type: 'review_posted' | 'tier_unlocked' | 'milestone_unlocked'; title: string; subtitle: string; icon: string; color: string };
type Props = { visible: boolean; onClose: () => void; moment: Moment; onShare?: () => void };

export function ShareMomentSheet({ visible, onClose, moment, onShare }: Props) {
  const handleShare = () => {
    onShare?.();
    haptics.success();
    track('prestige.share_moment_tapped');
    onClose();
  };

  const handleDismiss = () => {
    haptics.tap();
    track('prestige.share_moment_dismissed');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={[styles.iconCircle, { backgroundColor: moment.color + '22' }]}>
            <Ionicons name={moment.icon as never} size={28} color={moment.color} />
          </View>

          <Text style={styles.title}>{moment.title}</Text>
          <Text style={styles.subtitle}>{moment.subtitle}</Text>

          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            onPress={handleShare}
          >
            <Text style={styles.primaryBtnText}>Share</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            onPress={handleDismiss}
          >
            <Text style={styles.secondaryBtnText}>Maybe later</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
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
    backgroundColor: '#722F37',
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
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(45,45,45,0.60)',
  },
  pressed: { opacity: 0.80 },
});
