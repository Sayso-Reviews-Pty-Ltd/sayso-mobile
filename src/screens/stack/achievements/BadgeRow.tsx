import { Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { UserBadgeDto } from '../../../hooks/useUserBadges';
import { getBadgeImage } from '../../../lib/badgeImages';
import { getBadgeById } from '../../../lib/badgeMappings';
import { Text } from '../../../components/Typography';
import { C } from './constants';
import { styles } from './styles';

export function BadgeRow({ badge, earned }: { badge: UserBadgeDto; earned: boolean }) {
  const mapping = getBadgeById(badge.id);

  return (
    <View style={[styles.badgeRow, !earned ? styles.badgeRowLocked : null]}>
      <View style={[styles.badgeIconCircle, !earned ? styles.badgeIconCircleLocked : styles.badgeIconCircleEarned]}>
        {earned && mapping ? (
          <Image source={getBadgeImage(mapping.imageKey)} style={styles.badgeRowImg} />
        ) : (
          <Ionicons name="lock-closed-outline" size={18} color={C.white50} />
        )}
      </View>
      <View style={styles.badgeRowInfo}>
        <Text style={[styles.badgeRowName, !earned ? styles.badgeRowNameLocked : null]}>
          {badge.name}
        </Text>
        {badge.description ? (
          <Text style={styles.badgeRowDesc} numberOfLines={2}>{badge.description}</Text>
        ) : null}
        {earned && badge.awarded_at ? (
          <Text style={styles.badgeRowDate}>
            Earned {new Date(badge.awarded_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </Text>
        ) : null}
      </View>
      {earned ? (
        <Ionicons name="checkmark-circle-outline" size={18} color={C.gold} style={styles.badgeCheckmark} />
      ) : null}
    </View>
  );
}
