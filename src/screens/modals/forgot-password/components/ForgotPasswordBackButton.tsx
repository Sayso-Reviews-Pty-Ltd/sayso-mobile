import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, GRID } from '../constants';

type Props = {
  top: number;
  onPress: () => void;
};

export function ForgotPasswordBackButton({ top, onPress }: Props) {
  return (
    <View style={[styles.backBtnWrap, { top }]}>
      <Pressable style={styles.backBtn} onPress={onPress} hitSlop={12}>
        <Ionicons name="chevron-back-outline" size={22} color={C.charcoal} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtnWrap: {
    position: 'absolute',
    left: GRID * 2,
    zIndex: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(45,45,45,0.08)',
  },
});
