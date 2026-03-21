import { Animated, Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/Typography';
import { C } from './constants';
import { StarRating } from './StarRating';
import { styles } from './styles';
import type { ReviewerProfile } from './types';

type Props = {
  headerOpacity: Animated.Value;
  headerY: Animated.Value;
  imgError: boolean;
  onImageError: () => void;
  reviewer: ReviewerProfile;
};

export function ReviewerProfileHeader({
  headerOpacity,
  headerY,
  imgError,
  onImageError,
  reviewer,
}: Props) {
  return (
    <Animated.View
      style={[styles.headerCard, { opacity: headerOpacity, transform: [{ translateY: headerY }] }]}
    >
      <View style={styles.profileRow}>
        <View style={styles.avatarWrap}>
          {!imgError && reviewer.profilePicture ? (
            <Image source={{ uri: reviewer.profilePicture }} style={styles.avatar} onError={onImageError} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Ionicons name="person-outline" size={40} color={C.charcoal50} />
            </View>
          )}
          {reviewer.badge === 'verified' ? (
            <View style={[styles.badgeDot, styles.badgeDotVerified]}>
              <Ionicons name="checkmark-outline" size={10} color={C.white} strokeWidth={3} />
            </View>
          ) : null}
          {reviewer.badge === 'top' ? (
            <View style={[styles.badgeDot, styles.badgeDotTop]}>
              <Ionicons name="trophy-outline" size={10} color={C.white} />
            </View>
          ) : null}
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.reviewerName}>{reviewer.name}</Text>
            {reviewer.trophyBadge ? (
              <View
                style={[
                  styles.trophyBadge,
                  styles[`trophyBadge_${reviewer.trophyBadge}` as keyof typeof styles] as object,
                ]}
              >
                <Text style={styles.trophyBadgeText}>{reviewer.trophyBadge.replace('-', ' ')}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={13} color={C.charcoal60} />
            <Text style={styles.metaText}>{reviewer.location}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={13} color={C.charcoal60} />
            <Text style={styles.metaText}>Member since {reviewer.memberSince}</Text>
          </View>
          <View style={styles.ratingRow}>
            <StarRating rating={reviewer.averageRating} size={14} />
            <Text style={styles.ratingValue}>{reviewer.averageRating.toFixed(1)}</Text>
            <Text style={styles.reviewCountText}>· {reviewer.reviewCount} reviews</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
