import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants';
import { styles } from '../ResetPasswordScreen.styles';

type Props = {
  top: number;
  onPress: () => void;
};

export function ResetPasswordBackButton({ top, onPress }: Props) {
  return (
    <View style={[styles.backBtnWrap, { top }]}>
      <Pressable style={styles.backBtn} onPress={onPress} hitSlop={12}>
        <Ionicons name="chevron-back-outline" size={22} color={C.charcoal} />
      </Pressable>
    </View>
  );
}
