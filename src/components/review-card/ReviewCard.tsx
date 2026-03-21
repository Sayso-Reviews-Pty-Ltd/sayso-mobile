import { useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { haptics } from '../../lib/haptics';
import { Text } from '../Typography';
import { useAuth } from '../../providers/AuthProvider';
import { useReviewHelpful } from '../../hooks/useReviewHelpful';
import { C, styles } from './ReviewCard.styles';

// ─── Shared review data type (normalised from both ReviewItem & EventReviewItem)
export interface ReviewCardData {
  id: string;
  userId: string | null;
  rating: number;
  title?: string;
  content: string;
  tags?: string[];
  helpfulCount: number;
  createdAt: string;
  user: {
    id: string | null;
    name: string;
    avatarUrl?: string | null;
  };
  images?: string[];
}

const BODY_COLLAPSE_THRESHOLD = 200;

// ─── Relative date (no dayjs needed)
function relativeDate(iso: string): string {
  if (!iso) return 'Recently';
  const diff = Date.now() - new Date(iso).getTime();
  if (isNaN(diff)) return 'Recently';
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

// ─── Avatar
function Avatar({ src, name }: { src?: string | null; name: string }) {
  const [imgError, setImgError] = useState(false);
  const initial = (name || 'U')[0].toUpperCase();

  if (src && !imgError) {
    return (
      <Image
        source={{ uri: src }}
        style={styles.avatar}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <View style={styles.avatarFallback}>
      <Text style={styles.avatarInitial}>{initial}</Text>
    </View>
  );
}

// ─── Stars — clamped to 0–5
const STAR_GRADIENT = ['#FDE68A', '#FBBF24', '#D97706'] as const;

function Stars({ rating }: { rating: number }) {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating)));

  if (safeRating === 0) {
    return (
      <View style={styles.noRatingPill}>
        <Text style={styles.noRatingText}>No rating</Text>
      </View>
    );
  }

  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        i <= safeRating ? (
          <LinearGradient
            key={i}
            colors={STAR_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.starFilledWrap}
          >
            <Ionicons testID="star-filled" name="star" size={16} color={C.white} />
          </LinearGradient>
        ) : (
          <Ionicons key={i} testID="star-empty" name="star" size={16} color={C.charcoal30} />
        )
      ))}
    </View>
  );
}

// ─── Review image with error fallback + lightbox trigger
function ReviewImage({ uri, onPress }: { uri: string; onPress: () => void }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <View style={[styles.reviewImage, styles.reviewImageError]}>
        <Ionicons name="image-outline" size={24} color={C.charcoal30} />
      </View>
    );
  }

  return (
    <Pressable onPress={onPress}>
      <Image
        source={{ uri }}
        style={styles.reviewImage}
        onError={() => setError(true)}
      />
    </Pressable>
  );
}

// ─── Image lightbox modal
function ImageLightbox({ uri, onClose }: { uri: string; onClose: () => void }) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.lightboxOverlay} onPress={onClose}>
        <Image source={{ uri }} style={styles.lightboxImage} resizeMode="contain" />
        <Pressable style={styles.lightboxClose} onPress={onClose}>
          <Ionicons name="close" size={22} color={C.white} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── ReviewCard
export function ReviewCard({ review }: { review: ReviewCardData }) {
  const { user } = useAuth();
  const { count, isHelpful, loading, toggle } = useReviewHelpful(
    review.id,
    review.helpfulCount,
  );

  const [expanded, setExpanded] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const isAnonymous = !review.userId;
  const isLongBody = review.content.length > BODY_COLLAPSE_THRESHOLD;
  const validTags = review.tags?.filter((t) => t.trim() !== '') ?? [];
  const validImages = review.images?.filter(Boolean) ?? [];

  const handleToggleHelpful = () => {
    haptics.confirm();
    toggle();
  };

  return (
    <LinearGradient
      colors={[C.offWhite, C.offWhite, C.offWhiteBg]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
      accessibilityLabel={`Review by ${review.user?.name ?? 'reviewer'}, ${review.rating} stars`}
    >
      <View style={styles.row}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <Avatar src={review.user.avatarUrl} name={review.user.name} />
        </View>

        <View style={styles.content}>
          {/* Header: name + verified + stars + date */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {review.user.name}
                </Text>
                {isAnonymous ? (
                  <View style={styles.anonPill}>
                    <Text style={styles.anonText}>Anonymous</Text>
                  </View>
                ) : (
                  <Ionicons
                    testID="verified-checkmark"
                    name="checkmark-circle-outline"
                    size={14}
                    color={C.sage}
                  />
                )}
              </View>
            </View>

            <View style={styles.headerRight}>
              <Stars rating={review.rating} />
              <Text style={styles.date}>{relativeDate(review.createdAt)}</Text>
            </View>
          </View>

          {/* Title */}
          {review.title ? (
            <Text style={styles.title} numberOfLines={2}>{review.title}</Text>
          ) : null}

          {/* Body */}
          <Text
            style={styles.body}
            numberOfLines={expanded || !isLongBody ? undefined : 4}
          >
            {review.content}
          </Text>
          {isLongBody ? (
            <Pressable onPress={() => setExpanded((v) => !v)}>
              <Text style={styles.readMoreText}>
                {expanded ? 'Show less' : 'Read more'}
              </Text>
            </Pressable>
          ) : null}

          {/* Tags */}
          {validTags.length > 0 ? (
            <View style={styles.tagsRow}>
              {validTags.map((tag) => (
                <View key={tag} style={styles.tagPill}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Images */}
          {validImages.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imagesScroll}
              contentContainerStyle={styles.imagesContent}
              nestedScrollEnabled={Platform.OS === 'android'}
            >
              {validImages.map((uri, i) => (
                <ReviewImage key={uri} uri={uri} onPress={() => setPreviewUri(uri)} />
              ))}
            </ScrollView>
          ) : null}

          {/* Actions */}
          <View style={styles.actionsRow}>
            <Pressable
              style={[
                styles.helpfulBtn,
                isHelpful && styles.helpfulBtnActive,
                !user && styles.helpfulBtnGuest,
              ]}
              onPress={user ? handleToggleHelpful : undefined}
              disabled={loading}
              accessibilityLabel={isHelpful ? 'Mark as not helpful' : 'Mark as helpful'}
              accessibilityRole="button"
            >
              <Ionicons
                name={isHelpful ? 'heart' : 'heart-outline'}
                size={16}
                color={isHelpful ? C.sage : !user ? C.charcoal30 : C.charcoal45}
              />
              <Text
                style={[
                  styles.helpfulText,
                  isHelpful && styles.helpfulTextActive,
                  !user && styles.helpfulTextGuest,
                ]}
              >
                Helpful ({count})
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {previewUri ? (
        <ImageLightbox uri={previewUri} onClose={() => setPreviewUri(null)} />
      ) : null}
    </LinearGradient>
  );
}
