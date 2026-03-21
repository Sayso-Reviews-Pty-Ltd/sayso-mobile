import { Animated, Image, View } from 'react-native';
import { Text } from '../../../components/Typography';
import { getBadgeById } from '../../../lib/badgeMappings';
import { getBadgeImage } from '../../../lib/badgeImages';
import { styles } from './styles';
import type { ReviewerBadge } from './types';

type Props = {
  badges: ReviewerBadge[];
  contentOpacity: Animated.Value;
  contentY: Animated.Value;
};

export function ReviewerBadgesSection({ badges, contentOpacity, contentY }: Props) {
  if (!badges || badges.length === 0) {
    return null;
  }

  return (
    <Animated.View style={[styles.section, { opacity: contentOpacity, transform: [{ translateY: contentY }] }]}> 
      <Text style={styles.sectionTitle}>Badges & Achievements ({badges.length})</Text>
      <View style={styles.badgesGrid}>
        {badges.map((badge) => {
          const mapping = getBadgeById(badge.id);
          const imageSource = mapping ? getBadgeImage(mapping.imageKey) : { uri: badge.icon };

          return (
            <View key={badge.id} style={styles.badgeItem}>
              <Image source={imageSource} style={styles.badgePng} />
              <View style={styles.badgeInfo}>
                <Text style={styles.badgeName}>{badge.name}</Text>
                <Text style={styles.badgeEarned}>Earned {badge.earnedDate}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}
