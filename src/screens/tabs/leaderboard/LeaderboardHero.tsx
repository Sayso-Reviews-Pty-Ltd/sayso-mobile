import { View } from 'react-native';
import { Text } from '../../../components/Typography';
import { styles } from './styles';

export function LeaderboardHero() {
  return (
    <View style={styles.hero}>
      <Text style={styles.heroTitle}>Community Highlights</Text>
      <Text style={styles.heroSub}>
        Celebrate the top contributors and businesses in our community. See who&apos;s making a difference and discover the most loved local spots.
      </Text>
    </View>
  );
}
