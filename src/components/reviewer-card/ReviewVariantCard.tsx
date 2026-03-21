import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { RecentReviewDto } from '@sayso/contracts';
import { Text } from '../Typography';
import { Avatar } from './Avatar';
import { BadgeChip } from './BadgeChip';
import { Stars } from './Stars';
import { reviewStyles } from './styles';
import { C } from './theme';
import type { BadgeType } from './types';

type Props = {
  review: RecentReviewDto;
  onPress: () => void;
};

export function ReviewVariantCard({ review, onPress }: Props) {
  const reviewer = review.reviewer;
  const primaryBadge = reviewer.badge as BadgeType | undefined;
  const badgesCount = reviewer.badgesCount ?? 0;
  const extraCount = Math.max(0, badgesCount - (primaryBadge ? 1 : 0));

  return (
    <Pressable style={reviewStyles.card} onPress={onPress} accessibilityRole="button">
      <LinearGradient
        colors={['rgba(114,47,55,0.50)', 'rgba(125,155,118,0.50)', 'rgba(114,47,55,0.30)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={reviewStyles.accent}
      />

      <LinearGradient
        colors={['transparent', C.cardBg]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={reviewStyles.bottomFade}
        pointerEvents="none"
      />

      <View style={reviewStyles.body}>
        {review.rating != null ? (
          <View style={reviewStyles.starsRow}>
            <Stars rating={review.rating} size={12} />
            <Text style={reviewStyles.ratingNum}>{Number(review.rating).toFixed(1)}</Text>
          </View>
        ) : null}

        <View style={reviewStyles.identityRow}>
          <Avatar
            src={reviewer.profilePicture}
            name={reviewer.name}
            size={28}
            badge={reviewer.badge as BadgeType}
            isTopCard={false}
          />
          <View style={reviewStyles.identityText}>
            <Text style={reviewStyles.reviewerName} numberOfLines={1}>
              {reviewer.name}
            </Text>
            <Text style={reviewStyles.reviewCount}>{reviewer.reviewCount || 0} reviews</Text>
          </View>
        </View>

        {(primaryBadge || extraCount > 0) && (
          <View style={reviewStyles.badgeRow}>
            {primaryBadge ? <BadgeChip badge={primaryBadge} isTopCard={false} /> : null}
            {extraCount > 0 ? (
              <View style={reviewStyles.overflowChip}>
                <Text style={reviewStyles.overflowText}>+{extraCount}</Text>
              </View>
            ) : null}
          </View>
        )}

        <View style={reviewStyles.contentArea}>
          <View>
            {review.businessName ? (
              <View style={reviewStyles.businessRow}>
                <Ionicons name="location-outline" size={10} color={C.charcoal28} />
                <Text style={reviewStyles.businessName} numberOfLines={1}>
                  {review.businessName}
                </Text>
              </View>
            ) : null}
            <Text style={reviewStyles.reviewText} numberOfLines={2}>
              {review.reviewText ? `"${review.reviewText}"` : ''}
            </Text>
          </View>

          <View style={reviewStyles.footer}>
            <Text style={reviewStyles.date}>{review.date || ''}</Text>
            <View style={reviewStyles.footerRight}>
              {(review.likes ?? 0) > 0 ? (
                <View style={reviewStyles.likesRow}>
                  <Ionicons name="heart-outline" size={12} color={C.coralFill} />
                  <Text style={reviewStyles.likesCount}>{review.likes}</Text>
                </View>
              ) : null}
              <Ionicons name="chevron-forward-outline" size={14} color={C.charcoal20} />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
