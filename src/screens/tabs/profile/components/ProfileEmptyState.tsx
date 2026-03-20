import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../components/Typography';
import { CHARCOAL, CORAL } from '../constants';

type Props = {
  onSignIn: () => void;
};

export function ProfileEmptyState({ onSignIn }: Props) {
  return (
    <View style={styles.centeredState}>
      <Ionicons name="person-circle-outline" size={44} color="rgba(45,45,45,0.55)" />
      <Text style={styles.centeredTitle}>Sign in to view your profile</Text>
      <Pressable style={styles.primaryActionButton} onPress={onSignIn}>
        <Text style={styles.primaryActionText}>Sign in</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  centeredTitle: {
    fontSize: 18,
    color: CHARCOAL,
    fontWeight: '700',
    textAlign: 'center',
  },
  primaryActionButton: {
    marginTop: 6,
    borderRadius: 999,
    backgroundColor: CORAL,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
