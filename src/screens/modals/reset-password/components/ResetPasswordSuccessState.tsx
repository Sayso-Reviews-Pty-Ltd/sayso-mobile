import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../components/Typography';
import { C } from '../constants';
import { styles } from '../ResetPasswordScreen.styles';

export function ResetPasswordSuccessState() {
  return (
    <>
      <View style={styles.stateIconWrap}>
        <View style={[styles.stateCircle, styles.stateCircleSuccess]}>
          <Ionicons name="checkmark-outline" size={36} color={C.sage} />
        </View>
      </View>
      <Text style={styles.stateMessage}>All set! You're being redirected to home.</Text>
    </>
  );
}
