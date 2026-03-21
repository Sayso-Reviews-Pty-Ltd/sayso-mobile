import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { businessDetailColors } from '../../../components/business-detail/styles';
import { Text } from '../../../components/Typography';
import { routes } from '../../../navigation/routes';
import { styles } from './styles';

export function LeaderboardBadgeSection() {
  const router = useRouter();

  return (
    <View style={styles.badgeSection}>
      <Text style={styles.badgeSectionTitle}>What Do Your Badges Mean?</Text>
      <Text style={styles.badgeSectionSub}>Learn about all the badges you can earn</Text>
      <View style={styles.badgeBtns}>
        <Pressable
          style={styles.badgePrimaryBtn}
          onPress={() => router.push(routes.badges() as never)}
        >
          <Ionicons name="ribbon-outline" size={14} color={businessDetailColors.coral} />
          <Text style={styles.badgePrimaryText}>View badge guide</Text>
        </Pressable>
        <Pressable
          style={styles.badgeSecondaryBtn}
          onPress={() => router.push(routes.achievements() as never)}
        >
          <Ionicons name="trophy-outline" size={14} color="#fff" />
          <Text style={styles.badgeSecondaryText}>Achievements</Text>
        </Pressable>
      </View>
    </View>
  );
}
