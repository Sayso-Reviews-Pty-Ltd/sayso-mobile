import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotifications } from '../hooks/useNotifications';
import { routes } from '../navigation/routes';
import { Text } from './Typography';
import { businessDetailColors } from './business-detail/styles';
import { FROSTED_CARD_BORDER_COLOR } from '../styles/cardSurface';
import { CARD_CTA_RADIUS } from '../styles/radii';

export function HeaderBellButton() {
  const router = useRouter();
  const { unreadCount } = useNotifications();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => router.push(routes.notifications() as never)}
      activeOpacity={0.8}
    >
      <Ionicons name="notifications-outline" size={20} color={businessDetailColors.white} />
      {unreadCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
        </View>
      ) : null}
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
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: businessDetailColors.page,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: businessDetailColors.coral,
    fontSize: 10,
    fontWeight: '700',
  },
});
