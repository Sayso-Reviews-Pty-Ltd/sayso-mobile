import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { routes } from '../navigation/routes';
import { businessDetailColors } from './business-detail/styles';
import { FROSTED_CARD_BORDER_COLOR } from '../styles/cardSurface';
import { CARD_CTA_RADIUS } from '../styles/radii';

export function HeaderDmButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => router.push(routes.dmInbox() as never)}
      activeOpacity={0.8}
      accessibilityLabel="Open direct messages"
    >
      <Ionicons name="chatbubble-outline" size={18} color={businessDetailColors.white} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: CARD_CTA_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: businessDetailColors.borderSoft,
    borderWidth: 1,
    borderColor: FROSTED_CARD_BORDER_COLOR,
  },
});
