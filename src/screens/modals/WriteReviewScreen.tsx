import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Dimensions,
  Image,
  InteractionManager,
  KeyboardAvoidingView,
  Platform,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Share,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { compressImageForUpload } from '../../lib/compressImage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, apiFetch } from '../../lib/api';
import { type UserBadgeDto } from '../../hooks/useUserBadges';
import { Text, TextInput } from '../../components/Typography';
import { StackPageHeader } from '../../components/StackPageHeader';
import { useAuth } from '../../providers/AuthProvider';
import { useSecurity } from '../../providers/SecurityProvider';
import { useBusinessDetail } from '../../hooks/useBusinessDetail';
import { useEventSpecialDetail } from '../../hooks/useEventSpecialDetail';
import { useGlobalScrollToTop } from '../../hooks/useGlobalScrollToTop';
import { useRealtimeQueryInvalidation } from '../../hooks/useRealtimeQueryInvalidation';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useSavedBusinesses } from '../../hooks/useSavedBusinesses';
import type { WriteReviewParams } from '../../navigation/types';
import { routes } from '../../navigation/routes';
import { NAVBAR_BG_COLOR, CARD_BG_COLOR } from '../../styles/colors';
import { getBusinessPlaceholder } from '../../lib/businessPlaceholders';
import { BusinessHeroCarousel, type BusinessHeaderRightAction } from '../../components/business-detail';
import { normalizeBusinessRating } from '../../components/business-detail/utils';
import { CARD_GRADIENT, cardShadowStyle } from '../../components/business-detail/styles';
import { ENV } from '../../lib/env';
import { useBusinessReviews } from '../../hooks/useBusinessReviews';
import { useEventReviews } from '../../hooks/useEventReviews';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// ─── Constants
const MIN_CHARS = 10;
const MAX_CHARS = 5000;
const MAX_TITLE_CHARS = 100;
const MAX_PHOTOS = 2;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_WIDTH = SCREEN_WIDTH - 16; // matches page inline padding (px-2)
const HERO_HEIGHT = Math.round(SCREEN_HEIGHT * 0.50); // matches web h-[50vh]
const CONFETTI_PARTICLE_COUNT = 240;
const CONFETTI_FALL_DISTANCE = Math.max(SCREEN_HEIGHT * 1.1, 700);

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

const WRITING_PROMPTS = [
  'What did you enjoy most?',
  'How was the service?',
  'Would you recommend this place?',
  'Any tips for others?',
];

const FALLBACK_TAGS = ['Trustworthy', 'On Time', 'Friendly', 'Good Value'];

const REVIEW_ERROR_MESSAGES: Record<string, string> = {
  NOT_AUTHENTICATED: 'You can post as Anonymous, or sign in for a verified profile review.',
  EMAIL_NOT_VERIFIED: 'Please verify your email to submit reviews.',
  MISSING_FIELDS: 'Please fill in all required fields.',
  INVALID_RATING: 'Please select a rating (1–5 stars).',
  CONTENT_TOO_SHORT: 'Your review is too short. Please write at least 10 characters.',
  CONTENT_TOO_LONG: 'Your review is too long. Please keep it under 5000 characters.',
  TITLE_TOO_LONG: 'Review title is too long. Please keep it under 100 characters.',
  VALIDATION_FAILED: 'Please check your review and try again.',
  CONTENT_MODERATION_FAILED: "Your review contains content that doesn't meet our guidelines.",
  BUSINESS_NOT_FOUND: "We couldn't find that business. Please try again.",
  EVENT_NOT_FOUND: "We couldn't find that event. It may have been removed.",
  SPECIAL_NOT_FOUND: "We couldn't find that special. It may have expired.",
  DUPLICATE_REVIEW: "You've already reviewed this. You can edit your existing review instead.",
  DUPLICATE_ANON_REVIEW: 'You already posted an anonymous review for this item on this device.',
  RATE_LIMITED: 'Too many anonymous reviews in a short time. Please try again later.',
  SPAM_DETECTED: 'This review was flagged as spam-like. Please adjust wording and try again.',
  RLS_BLOCKED: "We couldn't save your review right now. Please try again.",
  DB_ERROR: "We couldn't save your review. Please try again.",
  IMAGE_UPLOAD_FAILED: "Some images couldn't be uploaded. Your review was saved.",
  SERVER_MISCONFIG: 'Server configuration issue. Please contact support.',
  SERVER_ERROR: 'Something went wrong on our side. Please try again.',
};

const GENERIC_API_MESSAGES = new Set([
  'Request failed',
  'The request could not be processed. Please try again.',
  'Unauthorized',
  'Your session has expired. Please sign in again.',
  'You are not allowed to perform this action.',
  'The requested resource was not found.',
  'Too many requests. Please wait and try again.',
  'Server error. Please try again in a moment.',
  'Network request failed. Check your connection and try again.',
]);

function isGenericApiMessage(message?: string): boolean {
  if (!message) return false;
  return GENERIC_API_MESSAGES.has(message.trim());
}

function getErrorMessage(result: { message?: string; code?: string; error?: string }): string {
  if (result.message && !isGenericApiMessage(result.message)) return result.message;
  if (result.code && REVIEW_ERROR_MESSAGES[result.code]) return REVIEW_ERROR_MESSAGES[result.code];
  if (result.error) return result.error;
  if (result.message) return result.message;
  return 'An error occurred. Please try again.';
}

function isPlaceholderImage(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return (
    url.includes('businessImagePlaceholders/') ||
    url.includes('assets/businessImagePlaceholders/')
  );
}

function toSingleParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

type ExistingReviewDto = {
  id: string;
  rating?: number;
  title?: string | null;
  content?: string | null;
  body?: string | null;
  tags?: string[] | null;
};

// ─── Colors — brand tokens from src/styles/colors.ts; rest derived inline
const C = {
  offWhite: '#E5E0E5',
  charcoal: '#2D2D2D',
  charcoal60: 'rgba(45,45,45,0.60)',
  charcoal45: 'rgba(45,45,45,0.45)',
  charcoal30: 'rgba(45,45,45,0.30)',
  charcoal10: 'rgba(45,45,45,0.10)',
  coral: NAVBAR_BG_COLOR,   // navbar-bg #722F37
  sage: CARD_BG_COLOR,      // card-bg   #9DAB9B
  white: '#FFFFFF',
  amber: '#D4915C',
  sageBorder: 'rgba(125,155,118,0.10)',
  cardBg: CARD_BG_COLOR,
  errorBg: 'rgba(114,47,55,0.08)',
  errorBorder: 'rgba(114,47,55,0.25)',
};

// ─── Divider
function Divider() {
  return <View style={{ height: 1, backgroundColor: 'rgba(45,45,45,0.08)', marginVertical: 4 }} />;
}

// ─── Hero Image Carousel
function ReviewHeroCarousel({ images, name, subcategorySlug }: { images: string[]; name: string; subcategorySlug?: string | null }) {
  const reducedMotion = useReducedMotion();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const validImages = images.filter((img) => img && img.trim() !== '' && !isPlaceholderImage(img));
  const total = validImages.length;

  if (total === 0) {
    const placeholder = getBusinessPlaceholder(subcategorySlug);
    return (
      <View style={carouselStyles.container}>
        {/* blurred bg layer — same as real images */}
        <Image source={placeholder} style={carouselStyles.bgImage} blurRadius={20} />
        <Image source={placeholder} style={carouselStyles.fgImage} resizeMode="cover" />
      </View>
    );
  }

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, total - 1));
    scrollRef.current?.scrollTo({ x: clamped * HERO_WIDTH, animated: !reducedMotion });
    setCurrentIndex(clamped);
  };

  const handleScroll = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / HERO_WIDTH);
    setCurrentIndex(Math.max(0, Math.min(index, total - 1)));
  };

  return (
    <View style={carouselStyles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        scrollEnabled={total > 1}
      >
        {validImages.map((uri, i) => (
          <View key={i} style={carouselStyles.slide}>
            {!imgErrors[i] && (
              <Image
                source={{ uri }}
                style={carouselStyles.bgImage}
                blurRadius={20}
                onError={() => setImgErrors((prev) => ({ ...prev, [i]: true }))}
              />
            )}
            {imgErrors[i] ? (
              <View style={carouselStyles.errorState}>
                <Ionicons name="image-outline" size={40} color="rgba(45,45,45,0.30)" />
                <Text style={carouselStyles.errorText}>Image unavailable</Text>
              </View>
            ) : (
              <Image source={{ uri }} style={carouselStyles.fgImage} resizeMode="cover" />
            )}
          </View>
        ))}
      </ScrollView>

      {total > 1 && (
        <>
          <Pressable style={[carouselStyles.navBtn, carouselStyles.navBtnLeft]} onPress={() => goTo(currentIndex - 1)}>
            <Ionicons name="chevron-back-outline" size={22} color={C.charcoal} />
          </Pressable>
          <Pressable style={[carouselStyles.navBtn, carouselStyles.navBtnRight]} onPress={() => goTo(currentIndex + 1)}>
            <Ionicons name="chevron-forward-outline" size={22} color={C.charcoal} />
          </Pressable>
          <View style={carouselStyles.dotsRow}>
            {validImages.map((_, i) => (
              <Pressable key={i} onPress={() => goTo(i)}>
                <View style={[carouselStyles.dot, i === currentIndex && carouselStyles.dotActive]} />
              </Pressable>
            ))}
          </View>
          <View style={carouselStyles.counterPill}>
            <Text style={carouselStyles.counterText}>{currentIndex + 1} / {total}</Text>
          </View>
        </>
      )}
    </View>
  );
}

const carouselStyles = StyleSheet.create({
  container: {
    width: HERO_WIDTH,
    height: HERO_HEIGHT,
    borderWidth: 1,
    borderColor: 'rgba(125,155,118,0.12)',
    backgroundColor: C.cardBg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  slide: {
    width: HERO_WIDTH,
    height: HERO_HEIGHT,
    overflow: 'hidden',
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  fgImage: {
    ...StyleSheet.absoluteFillObject,
  },
  navBtn: {
    position: 'absolute',
    top: HERO_HEIGHT / 2 - 22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  navBtnLeft: { left: 12 },
  navBtnRight: { right: 12 },
  dotsRow: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  dotActive: {
    width: 28,
    borderRadius: 4,
    backgroundColor: C.white,
  },
  counterPill: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(45,45,45,0.80)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  counterText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.white,
  },
  errorState: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.charcoal10,
  },
  errorText: {
    fontSize: 12,
    color: 'rgba(45,45,45,0.45)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});

// ─── Animated writing tip (matches web: opacity + y slide, AnimatePresence mode="wait")
function AnimatedTip({ promptIndex, reducedMotion }: { promptIndex: number; reducedMotion: boolean }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const [visibleIndex, setVisibleIndex] = useState(promptIndex);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    if (reducedMotion) { setVisibleIndex(promptIndex); return; }

    // Exit: fade out + slide up (web: opacity 0, y -8, 300ms)
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -8, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setVisibleIndex(promptIndex);
      translateY.setValue(8); // reset to entry position (web: initial y 8)
      // Enter: fade in + slide to rest (web: opacity 1, y 0, 300ms)
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  }, [promptIndex]);

  return (
    <Animated.View style={[styles.tipOverlay, { opacity, transform: [{ translateY }] }]} pointerEvents="none">
      <Ionicons name="bulb-outline" size={14} color={C.coral} style={{ opacity: 0.6 }} />
      <Text style={styles.tipText}>Tip: {WRITING_PROMPTS[visibleIndex]}</Text>
    </Animated.View>
  );
}

// ─── Gradient star (two-layer clip: bright gold top, deep amber base)
function GradientStar({ filled, size = 42 }: { filled: boolean; size?: number }) {
  if (!filled) {
    return <Ionicons name="star-outline" size={size} color={C.charcoal30} />;
  }
  return (
    <View style={{ width: size, height: size }}>
      {/* Base layer — deep warm amber */}
      <Ionicons name="star-outline" size={size} color="#C8720A" />
      {/* Top 42% — bright gold highlight, clipped */}
      <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', height: Math.round(size * 0.42) }]}>
        <Ionicons name="star-outline" size={size} color="#FFD747" />
      </View>
    </View>
  );
}

// ─── Rating selector
function RatingSelector({
  value, onChange, disabled,
}: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  const reducedMotion = useReducedMotion();

  // Animated label (matches web: AnimatePresence mode="wait", key=displayRating)
  const labelOpacity = useRef(new Animated.Value(1)).current;
  const labelTranslateY = useRef(new Animated.Value(0)).current;
  const labelScale = useRef(new Animated.Value(1)).current;
  const [visibleRating, setVisibleRating] = useState(value);
  const isFirstRating = useRef(true);

  useEffect(() => {
    if (isFirstRating.current) { isFirstRating.current = false; setVisibleRating(value); return; }
    if (reducedMotion) { setVisibleRating(value); return; }
    // Exit: opacity 0, y +8, scale 0.9 (web: initial exit)
    Animated.parallel([
      Animated.timing(labelOpacity, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(labelTranslateY, { toValue: 8, duration: 100, useNativeDriver: true }),
      Animated.timing(labelScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      setVisibleRating(value);
      labelTranslateY.setValue(-8); // enter from above
      Animated.parallel([
        Animated.timing(labelOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(labelTranslateY, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(labelScale, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  }, [value]);

  // Per-star press scale + active-star wiggle
  const starScales = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(1))).current;
  const starRotates = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(0))).current;

  const handleStarPress = (i: number) => {
    if (disabled) return;
    onChange(i);
    if (!reducedMotion) {
      Animated.sequence([
        Animated.timing(starRotates[i - 1], { toValue: -10, duration: 80, useNativeDriver: true }),
        Animated.timing(starRotates[i - 1], { toValue: 10, duration: 80, useNativeDriver: true }),
        Animated.timing(starRotates[i - 1], { toValue: 0, duration: 80, useNativeDriver: true }),
      ]).start();
    }
  };

  const label = visibleRating > 0 ? RATING_LABELS[visibleRating] : null;

  return (
    <View style={rStyles.wrap}>
      <Text style={rStyles.heading}>How was your experience?</Text>
      <Animated.View style={[rStyles.labelSlot, { opacity: labelOpacity, transform: [{ translateY: labelTranslateY }, { scale: labelScale }] }]}>
        {label ? (
          <View style={rStyles.labelPill}><Text style={rStyles.labelText}>{label}</Text></View>
        ) : (
          <Text style={rStyles.tapHint}>Tap a star to rate</Text>
        )}
      </Animated.View>
      <View style={rStyles.starsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Animated.View key={i} style={{ transform: [{ scale: starScales[i - 1] }, { rotate: starRotates[i - 1].interpolate({ inputRange: [-10, 0, 10], outputRange: ['-10deg', '0deg', '10deg'] }) }] }}>
            <Pressable
              onPress={() => handleStarPress(i)}
              onPressIn={() => !reducedMotion && Animated.timing(starScales[i - 1], { toValue: 0.9, duration: 80, useNativeDriver: true }).start()}
              onPressOut={() => !reducedMotion && Animated.timing(starScales[i - 1], { toValue: 1, duration: 120, useNativeDriver: true }).start()}
              style={rStyles.starBtn}
              accessibilityRole="button"
              accessibilityLabel={`Rate ${i} star${i !== 1 ? 's' : ''}`}
            >
              <GradientStar filled={i <= value} size={42} />
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}
const rStyles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10, paddingVertical: 4 },
  heading: { fontSize: 16, fontWeight: '600', color: C.charcoal },
  tapHint: { fontSize: 14, color: C.charcoal60 },
  labelPill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999, backgroundColor: C.charcoal10 },
  labelText: { fontSize: 16, fontWeight: '700', color: C.charcoal },
  labelSlot: { minHeight: 30, alignItems: 'center', justifyContent: 'center' },
  starsRow: { flexDirection: 'row', gap: 4, marginTop: 4 },
  starBtn: { padding: 6 },
});

// ─── Tag selector
function TagSelector({
  tags, selected, onToggle, disabled,
}: { tags: string[]; selected: string[]; onToggle: (tag: string) => void; disabled?: boolean }) {
  const reducedMotion = useReducedMotion();
  const maxReached = selected.length >= 4;

  // Per-tag animated values (entrance + icon swap)
  const tagAnimsRef = useRef(new Map<string, { opacity: Animated.Value; scale: Animated.Value; iconScale: Animated.Value; iconRotate: Animated.Value }>()).current;

  const getTagAnim = (tag: string) => {
    if (!tagAnimsRef.has(tag)) {
      tagAnimsRef.set(tag, {
        opacity: new Animated.Value(0),
        scale: new Animated.Value(0.8),
        iconScale: new Animated.Value(1),
        iconRotate: new Animated.Value(0),
      });
    }
    return tagAnimsRef.get(tag)!;
  };

  // Entrance stagger when tags array changes
  useEffect(() => {
    const anims = tags.map((tag, index) => {
      const anim = getTagAnim(tag);
      if (reducedMotion) {
        anim.opacity.setValue(1);
        anim.scale.setValue(1);
        return null;
      }
      anim.opacity.setValue(0);
      anim.scale.setValue(0.8);
      return Animated.sequence([
        Animated.delay(index * 30),
        Animated.parallel([
          Animated.timing(anim.opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(anim.scale, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]),
      ]);
    }).filter(Boolean) as Animated.CompositeAnimation[];
    if (anims.length) Animated.parallel(anims).start();
  }, [tags]);

  // Animate icon on toggle
  const handleToggle = (tag: string) => {
    const isOn = selected.includes(tag);
    if (disabled || (!isOn && maxReached)) return;
    const anim = getTagAnim(tag);
    if (!reducedMotion) {
      Animated.timing(anim.iconScale, { toValue: 0, duration: 80, useNativeDriver: true }).start(() => {
        onToggle(tag);
        const willBeOn = !isOn;
        anim.iconRotate.setValue(willBeOn ? -180 : 0);
        Animated.parallel([
          Animated.timing(anim.iconScale, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.timing(anim.iconRotate, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]).start();
      });
    } else {
      onToggle(tag);
    }
  };

  // Remove hint slide-in
  const removeHintOpacity = useRef(new Animated.Value(0)).current;
  const removeHintTranslateY = useRef(new Animated.Value(-8)).current;
  const wasMaxReached = useRef(false);

  useEffect(() => {
    if (maxReached && !wasMaxReached.current) {
      wasMaxReached.current = true;
      if (reducedMotion) {
        removeHintOpacity.setValue(1);
        removeHintTranslateY.setValue(0);
      } else {
        removeHintOpacity.setValue(0);
        removeHintTranslateY.setValue(-8);
        Animated.parallel([
          Animated.timing(removeHintOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(removeHintTranslateY, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start();
      }
    } else if (!maxReached) {
      wasMaxReached.current = false;
      removeHintOpacity.setValue(0);
      removeHintTranslateY.setValue(-8);
    }
  }, [maxReached]);

  return (
    <View style={tStyles.section}>
      <View style={tStyles.header}>
        <View style={tStyles.headerLeft}>
          <Ionicons name="sparkles-outline" size={16} color={C.coral} style={{ opacity: 0.8 }} />
          <Text style={tStyles.heading}>Quick tags</Text>
        </View>
        <View style={[tStyles.counterPill, selected.length > 0 && tStyles.counterPillActive]}>
          <Text style={[tStyles.counterText, selected.length > 0 && tStyles.counterTextActive]}>
            {selected.length}/4 selected
          </Text>
        </View>
      </View>
      <View style={tStyles.wrap}>
        {tags.map((tag) => {
          const isOn = selected.includes(tag);
          const isDisabled = disabled || (!isOn && maxReached);
          const anim = getTagAnim(tag);
          return (
            <Animated.View key={tag} style={{ opacity: anim.opacity, transform: [{ scale: anim.scale }] }}>
              <Pressable
                onPress={() => handleToggle(tag)}
                style={[tStyles.pill, isOn && tStyles.pillOn, isDisabled && !isOn && tStyles.pillDim]}
              >
                <Animated.View style={{ transform: [{ scale: anim.iconScale }, { rotate: anim.iconRotate.interpolate({ inputRange: [-180, 0], outputRange: ['-180deg', '0deg'] }) }] }}>
                  <Ionicons
                    name={isOn ? 'checkmark' : 'add'}
                    size={13}
                    color={isOn ? C.coral : isDisabled ? C.charcoal30 : C.charcoal60}
                    style={{ opacity: isOn ? 1 : 0.6 }}
                  />
                </Animated.View>
                <Text style={[tStyles.pillText, isOn && tStyles.pillTextOn, isDisabled && !isOn && tStyles.pillTextDim]}>
                  {tag}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
      {maxReached ? (
        <Animated.Text style={[tStyles.removeHint, { opacity: removeHintOpacity, transform: [{ translateY: removeHintTranslateY }] }]}>
          Tap a selected tag to remove it
        </Animated.Text>
      ) : null}
    </View>
  );
}
const tStyles = StyleSheet.create({
  section: { gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heading: { fontSize: 16, fontWeight: '600', color: C.charcoal },
  counterPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: C.charcoal10 },
  counterPillActive: { backgroundColor: 'rgba(114,47,55,0.15)' },
  counterText: { fontSize: 13, color: C.charcoal60 },
  counterTextActive: { color: C.coral },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 999, backgroundColor: C.charcoal10, borderWidth: 2, borderColor: 'rgba(45,45,45,0.20)',
  },
  pillOn: { backgroundColor: 'rgba(114,47,55,0.20)', borderColor: C.coral },
  pillDim: { opacity: 0.4 },
  pillText: { fontSize: 14, fontWeight: '600', color: 'rgba(45,45,45,0.70)' },
  pillTextOn: { color: C.charcoal },
  pillTextDim: { color: C.charcoal30 },
  removeHint: { fontSize: 13, color: C.charcoal60, textAlign: 'center', marginTop: 4 },
});

// ─── Relative date helper
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
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

// ─── Community review card
type CommunityReview = {
  id: string;
  userName: string;
  avatarUrl?: string | null;
  rating: number;
  text: string;
  date: string;
};

function CommunityReviewCard({ review }: { review: CommunityReview }) {
  const [avatarError, setAvatarError] = useState(false);
  return (
    <View style={crStyles.card}>
      <View style={crStyles.topRow}>
        <View style={crStyles.avatar}>
          {review.avatarUrl && !avatarError ? (
            <Image source={{ uri: review.avatarUrl }} style={crStyles.avatarImg} onError={() => setAvatarError(true)} />
          ) : (
            <Ionicons name="person-outline" size={16} color={C.sage} style={{ opacity: 0.7 }} />
          )}
        </View>
        <View style={crStyles.meta}>
          <Text style={crStyles.userName} numberOfLines={1}>{review.userName}</Text>
          <Text style={crStyles.date}>{review.date}</Text>
        </View>
        <View style={crStyles.ratingRow}>
          <Ionicons name="star-outline" size={12} color={C.coral} />
          <Text style={crStyles.ratingText}>{review.rating}</Text>
        </View>
      </View>
      <Text style={crStyles.text} numberOfLines={4}>{review.text}</Text>
    </View>
  );
}

function CommunityReviewCardSkeleton() {
  return (
    <View style={crStyles.card}>
      <View style={crStyles.topRow}>
        <View style={[crStyles.avatar, { backgroundColor: C.charcoal10 }]} />
        <View style={crStyles.meta}>
          <View style={{ width: 80, height: 10, borderRadius: 5, backgroundColor: C.charcoal10 }} />
          <View style={{ width: 50, height: 8, borderRadius: 4, backgroundColor: C.charcoal10, marginTop: 4 }} />
        </View>
      </View>
      <View style={{ gap: 6, marginTop: 8 }}>
        <View style={{ height: 10, borderRadius: 5, backgroundColor: C.charcoal10 }} />
        <View style={{ height: 10, borderRadius: 5, backgroundColor: C.charcoal10 }} />
        <View style={{ width: '70%', height: 10, borderRadius: 5, backgroundColor: C.charcoal10 }} />
      </View>
    </View>
  );
}

const crStyles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG_COLOR, borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: 'rgba(125,155,118,0.12)',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(229,224,229,0.90)', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', flexShrink: 0,
  },
  avatarImg: { width: 36, height: 36 },
  meta: { flex: 1, minWidth: 0 },
  userName: { fontSize: 13, fontWeight: '600', color: C.charcoal },
  date: { fontSize: 11, color: C.charcoal45, marginTop: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, flexShrink: 0 },
  ratingText: { fontSize: 12, color: C.charcoal60, fontWeight: '500' },
  text: { fontSize: 13, color: 'rgba(45,45,45,0.85)', lineHeight: 19 },
});

type ConfettiPiece = {
  key: number;
  left: number;
  delay: number;
  duration: number;
  drift: number;
  size: number;
  rotate: number;
  color: string;
  shape: 'square' | 'circle' | 'rect';
};

type FeedbackVariant = 'success' | 'warning' | 'error';

type FeedbackNotice = {
  id: number;
  variant: FeedbackVariant;
  title: string;
  message: string;
};

const CONFETTI_COLORS = [
  '#722F37',
  '#9DAB9B',
  '#FFD166',
  '#FF8C69',
  '#B5E48C',
  '#E5E0E5',
];

function ConfettiPieceView({ piece }: { piece: ConfettiPiece }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(piece.delay),
      Animated.timing(progress, {
        toValue: 1,
        duration: piece.duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    animation.start();

    return () => {
      animation.stop();
      progress.stopAnimation();
    };
  }, [piece.delay, piece.duration, progress]);

  const width = piece.shape === 'rect' ? Math.max(2, Math.round(piece.size * 0.42)) : piece.size;
  const height = piece.shape === 'rect' ? Math.round(piece.size * 1.8) : piece.size;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.confettiPiece,
        {
          left: piece.left,
          width,
          height,
          borderRadius: piece.shape === 'circle' ? piece.size / 2 : 2,
          backgroundColor: piece.color,
          opacity: progress.interpolate({
            inputRange: [0, 0.08, 0.9, 1],
            outputRange: [0, 1, 1, 0],
          }),
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [-24, CONFETTI_FALL_DISTANCE],
              }),
            },
            {
              translateX: progress.interpolate({
                inputRange: [0, 0.3, 0.7, 1],
                outputRange: [0, piece.drift * 0.4, piece.drift * 0.75, piece.drift],
              }),
            },
            {
              rotate: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', `${piece.rotate}deg`],
              }),
            },
          ],
        },
      ]}
    />
  );
}

function ReviewConfettiOverlay({ visible }: { visible: boolean }) {
  const pieces = useMemo<ConfettiPiece[]>(
    () =>
      Array.from({ length: CONFETTI_PARTICLE_COUNT }, (_, index) => ({
        key: index,
        left: Math.random() * SCREEN_WIDTH,
        delay: Math.random() * 600,
        duration: 1000 + Math.random() * 900,
        drift: (Math.random() - 0.5) * 180,
        size: 5 + Math.round(Math.random() * 10),
        rotate: 220 + Math.round(Math.random() * 360),
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        shape: (['square', 'circle', 'rect'] as const)[Math.floor(Math.random() * 3)],
      })),
    [visible]
  );

  if (!visible) return null;

  return (
    <View style={styles.confettiOverlay} pointerEvents="none">
      {pieces.map((piece) => (
        <ConfettiPieceView key={piece.key} piece={piece} />
      ))}
    </View>
  );
}

// ─── "What others are saying" section
function CommunityReviewsSection({ reviews, isLoading }: { reviews: CommunityReview[]; isLoading: boolean }) {
  return (
    <View style={communityStyles.section}>
      <Text style={communityStyles.heading}>What others are saying</Text>
      {isLoading ? (
        <View style={communityStyles.list}>
          {[0, 1, 2].map((i) => <CommunityReviewCardSkeleton key={i} />)}
        </View>
      ) : reviews.length === 0 ? (
        <View style={communityStyles.empty}>
          <View style={communityStyles.emptyIconWrap}>
            <Ionicons name="chatbubble-outline" size={24} color={C.sage} style={{ opacity: 0.6 }} />
          </View>
          <Text style={communityStyles.emptyTitle}>No reviews yet</Text>
          <Text style={communityStyles.emptyBody}>Be the first to review this business!</Text>
        </View>
      ) : (
        <View style={communityStyles.list}>
          {reviews.map((r) => <CommunityReviewCard key={r.id} review={r} />)}
        </View>
      )}
    </View>
  );
}

const communityStyles = StyleSheet.create({
  section: { marginTop: 32 },
  heading: {
    fontSize: 28, fontWeight: '800', color: C.charcoal,
    textAlign: 'center',
    paddingTop: 8, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(45,45,45,0.10)', marginBottom: 12,
  },
  list: { paddingBottom: 8, gap: 12 },
  empty: {
    backgroundColor: CARD_BG_COLOR,
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(125,155,118,0.12)',
    paddingVertical: 40, paddingHorizontal: 24, alignItems: 'center', gap: 6,
  },
  emptyIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: C.offWhite, alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontSize: 14, fontWeight: '600', color: 'rgba(45,45,45,0.80)' },
  emptyBody: { fontSize: 12, color: C.charcoal60, textAlign: 'center', lineHeight: 18 },
});

// ─── Main screen
export default function WriteReviewScreen() {
  const params = useLocalSearchParams<WriteReviewParams>();
  const id = toSingleParam(params.id) ?? '';
  const typeParam = toSingleParam(params.type);
  const reviewId = toSingleParam(params.reviewId);
  const type: WriteReviewParams['type'] =
    typeParam === 'business' || typeParam === 'event' || typeParam === 'special'
      ? typeParam
      : 'business';
  const isEditMode = Boolean(reviewId);
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();
  const { guardSensitiveAction } = useSecurity();
  const savedQuery = useSavedBusinesses();
  const reducedMotion = useReducedMotion();
  const scrollRef = useRef<ScrollView | null>(null);
  const scrollTopVisibleRef = useRef(false);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);

  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<Array<{ uri: string; name: string; mimeType: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [quickTags, setQuickTags] = useState<string[]>(FALLBACK_TAGS);
  const [promptIndex, setPromptIndex] = useState(0);
  const [textFocused, setTextFocused] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  const [showSuccessConfetti, setShowSuccessConfetti] = useState(false);
  const [notificationNotice, setNotificationNotice] = useState<FeedbackNotice | null>(null);
  const [toastNotice, setToastNotice] = useState<FeedbackNotice | null>(null);
  const [nonCriticalReady, setNonCriticalReady] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const successRedirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackSeqRef = useRef(0);

  // Form card entrance (matches web: opacity 0→1, y 20→0, duration 0.4s)
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(20)).current;

  // Section stagger: [rating, tags, title, body, photos, submit]
  const SECTION_DELAYS = [100, 150, 200, 200, 250, 300];
  const sectionAnims = useRef(SECTION_DELAYS.map(() => ({
    opacity: new Animated.Value(0),
    translateX: new Animated.Value(-20),
  }))).current;

  // Input focus scale
  const titleScale = useRef(new Animated.Value(1)).current;
  const bodyScale = useRef(new Animated.Value(1)).current;

  // Validation message (matches web: opacity 0, y -4 → opacity 1, y 0)
  const validationOpacity = useRef(new Animated.Value(0)).current;
  const validationTranslateY = useRef(new Animated.Value(-4)).current;
  const wasShowingValidation = useRef(false);

  // Progress bar animated width
  const progressAnim = useRef(new Animated.Value(0)).current;

  const isBusinessReview = type === 'business';
  const { data: businessDetail, isLoading: bizLoading } = useBusinessDetail(isBusinessReview ? id : '');
  const { data: eventSpecial, isLoading: esLoading } = useEventSpecialDetail(!isBusinessReview ? id : null);
  const isLoading = isBusinessReview ? bizLoading : esLoading;

  // Community reviews — deferred until after initial interactions
  const businessReviewsQuery = useBusinessReviews(
    isBusinessReview && nonCriticalReady ? id : ''
  );
  const eventReviewsResult = useEventReviews(
    !isBusinessReview && nonCriticalReady ? id : null
  );

  const communityReviews: CommunityReview[] = useMemo(() => {
    if (isBusinessReview) {
      const firstPage = businessReviewsQuery.data?.pages?.[0]?.data ?? [];
      return firstPage.map((r) => ({
        id: r.id,
        userName: r.display_name ?? r.username ?? 'Anonymous',
        avatarUrl: r.avatar_url ?? null,
        rating: r.rating,
        text: r.body ?? '',
        date: relativeDate(r.created_at),
      }));
    }
    return eventReviewsResult.reviews.map((r) => ({
      id: r.id,
      userName: r.user.name,
      avatarUrl: r.user.avatarUrl ?? null,
      rating: r.rating,
      text: r.content,
      date: relativeDate(r.createdAt),
    }));
  }, [isBusinessReview, businessReviewsQuery.data, eventReviewsResult.reviews]);

  const communityReviewsLoading = isBusinessReview
    ? businessReviewsQuery.isLoading
    : eventReviewsResult.isLoading;

  const reviewPrefilledRef = useRef(false);
  const submitAbortRef = useRef<AbortController | null>(null);
  const originalValuesRef = useRef<{ rating: number; reviewTitle: string; reviewText: string; selectedTags: string[] } | null>(null);
  const imagePickingRef = useRef(false);

  const reviewDetailQuery = useQuery({
    queryKey: ['review-detail', reviewId],
    queryFn: () => apiFetch<{ review?: ExistingReviewDto }>(`/api/reviews/${reviewId}`),
    enabled: Boolean(reviewId),
    staleTime: 30_000,
  });

  const existingReviewLoading = isEditMode && !reviewPrefilledRef.current && reviewDetailQuery.isLoading;

  useEffect(() => {
    reviewPrefilledRef.current = false;
  }, [reviewId]);

  // Realtime: invalidate review + business/event data when the reviews table changes
  const realtimeTargets = useMemo(() => isBusinessReview
    ? [
        {
          key: `write-review-biz-reviews-${id}`,
          table: 'reviews',
          filter: `business_id=eq.${id}`,
          queryKeys: [['business-reviews', id], ['business', id]],
          enabled: nonCriticalReady && Boolean(id),
        },
      ]
    : [
        {
          key: `write-review-event-reviews-${id}`,
          table: 'reviews',
          filter: `event_id=eq.${id}`,
          queryKeys: [['event-reviews', id], ['event-ratings', id], ['event-special-detail', id]],
          enabled: nonCriticalReady && Boolean(id),
        },
      ],
  [id, isBusinessReview, nonCriticalReady]);

  useRealtimeQueryInvalidation(realtimeTargets);

  // Hero images — align source precedence with web
  const heroImages: string[] = isBusinessReview && businessDetail
    ? (() => {
        const allImages: string[] = [];
        const pushIfValid = (candidate: unknown, allowPlaceholder = false) => {
          if (typeof candidate !== 'string') return;
          const trimmed = candidate.trim();
          if (!trimmed) return;
          if (!allowPlaceholder && isPlaceholderImage(trimmed)) return;
          if (!allImages.includes(trimmed)) allImages.push(trimmed);
        };

        const uploaded = (businessDetail as any).uploaded_images;
        if (Array.isArray(uploaded)) {
          uploaded.forEach((url) => pushIfValid(url));
        }
        pushIfValid((businessDetail as any).image_url);
        if (Array.isArray((businessDetail as any).images)) {
          (businessDetail as any).images.forEach((url: unknown) => pushIfValid(url));
        }
        pushIfValid((businessDetail as any).image);
        return allImages;
      })()
    : eventSpecial
    ? (() => {
        const es = eventSpecial as unknown as Record<string, unknown>;
        const firstArrayImage = Array.isArray(es.images) ? es.images[0] : null;
        const displayImageCandidate =
          es.image ?? es.imageUrl ?? es.image_url ?? firstArrayImage ?? null;
        if (typeof displayImageCandidate !== 'string') return [];
        const trimmed = displayImageCandidate.trim();
        return trimmed ? [trimmed] : [];
      })()
    : [];

  const charCount = reviewText.length;
  const charProgress = Math.min(1, charCount / MIN_CHARS);

  // Form entrance + section stagger on mount
  useEffect(() => {
    if (reducedMotion) {
      formOpacity.setValue(1);
      formTranslateY.setValue(0);
      sectionAnims.forEach((a) => { a.opacity.setValue(1); a.translateX.setValue(0); });
      return;
    }
    Animated.parallel([
      Animated.timing(formOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(formTranslateY, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
    sectionAnims.forEach((anim, index) => {
      Animated.sequence([
        Animated.delay(SECTION_DELAYS[index]),
        Animated.parallel([
          Animated.timing(anim.opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(anim.translateX, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ]).start();
    });
  }, []);

  // Title input focus scale
  useEffect(() => {
    if (reducedMotion) return;
    Animated.timing(titleScale, { toValue: titleFocused ? 1.01 : 1, duration: 200, useNativeDriver: true }).start();
  }, [titleFocused]);

  // Body textarea focus scale
  useEffect(() => {
    if (reducedMotion) return;
    Animated.timing(bodyScale, { toValue: textFocused ? 1.01 : 1, duration: 200, useNativeDriver: true }).start();
  }, [textFocused]);

  // Validation message fade+slide
  const showValidation = reviewText.trim().length > 0 && reviewText.trim().length < MIN_CHARS;
  useEffect(() => {
    if (showValidation && !wasShowingValidation.current) {
      wasShowingValidation.current = true;
      if (reducedMotion) { validationOpacity.setValue(1); validationTranslateY.setValue(0); return; }
      validationOpacity.setValue(0);
      validationTranslateY.setValue(-4);
      Animated.parallel([
        Animated.timing(validationOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(validationTranslateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    } else if (!showValidation) {
      wasShowingValidation.current = false;
      validationOpacity.setValue(0);
      validationTranslateY.setValue(-4);
    }
  }, [showValidation]);

  // Progress bar animated width
  useEffect(() => {
    Animated.timing(progressAnim, { toValue: charProgress, duration: reducedMotion ? 0 : 300, useNativeDriver: false }).start();
  }, [charProgress]);

  useEffect(() => {
    if (reviewText.length === 0 && !textFocused) {
      const t = setInterval(() => setPromptIndex((i) => (i + 1) % WRITING_PROMPTS.length), 4000);
      return () => clearInterval(t);
    }
  }, [reviewText.length, textFocused]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setNonCriticalReady(true);
    });
    return () => {
      task.cancel();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (successRedirectTimerRef.current) {
        clearTimeout(successRedirectTimerRef.current);
        successRedirectTimerRef.current = null;
      }
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
        notificationTimerRef.current = null;
      }
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
      submitAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!nonCriticalReady) return;
    let active = true;
    apiFetch<{ dealBreakers?: Array<{ label?: string }> }>('/api/deal-breakers')
      .then((payload) => {
        if (!active || !payload) return;
        const labels = (payload.dealBreakers ?? [])
          .map((item: { label?: string }) => (item?.label ?? '').trim())
          .filter(Boolean);
        if (labels.length > 0) setQuickTags([...new Set(labels)] as string[]);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [nonCriticalReady]);

  useEffect(() => {
    if (!isEditMode || reviewPrefilledRef.current) return;
    const review = reviewDetailQuery.data?.review;
    if (!review) return;

    const rating = typeof review.rating === 'number' ? review.rating : 0;
    const reviewTitle = (review.title ?? '').trim();
    const reviewText = (review.content ?? review.body ?? '').trim();
    const selectedTags = Array.isArray(review.tags)
      ? review.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0).slice(0, 4)
      : [];

    setRating(rating);
    setReviewTitle(reviewTitle);
    setReviewText(reviewText);
    setSelectedTags(selectedTags);

    originalValuesRef.current = {
      rating,
      reviewTitle,
      reviewText,
      selectedTags,
    };
    reviewPrefilledRef.current = true;
  }, [isEditMode, reviewDetailQuery.data?.review]);

  useEffect(() => {
    if (!isEditMode || !reviewDetailQuery.error) return;
    if (reviewDetailQuery.error instanceof ApiError) {
      setFormError(getErrorMessage({ message: reviewDetailQuery.error.message, code: reviewDetailQuery.error.code }));
      return;
    }
    setFormError('Failed to load review details for editing.');
  }, [isEditMode, reviewDetailQuery.error]);

  const hasContent = (() => {
    if (isEditMode && originalValuesRef.current) {
      const orig = originalValuesRef.current;
      return (
        rating !== orig.rating ||
        reviewTitle.trim() !== orig.reviewTitle ||
        reviewText.trim() !== orig.reviewText ||
        selectedTags.join(',') !== orig.selectedTags.join(',')
      );
    }
    return (
      rating > 0 ||
      reviewText.trim().length > 0 ||
      reviewTitle.trim().length > 0 ||
      selectedTags.length > 0 ||
      selectedImages.length > 0
    );
  })();

  const isFormValid = rating > 0 && reviewText.trim().length >= MIN_CHARS && !submitting && !existingReviewLoading && !isLoading;
  const controlsDisabled = submitting || existingReviewLoading;

  const effectiveQuickTags = useMemo(() => {
    const extra = selectedTags.filter((t) => !quickTags.includes(t));
    return extra.length > 0 ? [...extra, ...quickTags] : quickTags;
  }, [quickTags, selectedTags]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 4 ? [...prev, tag] : prev,
    );
  };

  const handleBack = useCallback(() => {
    if (!hasContent) { router.back(); return; }
    Alert.alert('Discard Review?', 'You have unsaved changes. Are you sure you want to leave?', [
      { text: 'Keep Editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => router.back() },
    ]);
  }, [hasContent, router]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      const showScrollTop = y > 320;
      if (scrollTopVisibleRef.current !== showScrollTop) {
        scrollTopVisibleRef.current = showScrollTop;
        setShowScrollTopButton(showScrollTop);
      }
    },
    []
  );

  const handleScrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  useGlobalScrollToTop({
    visible: showScrollTopButton,
    enabled: true,
    onScrollToTop: handleScrollToTop,
  });

  const processPickedAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    const compressed = await compressImageForUpload(asset.uri);
    const filename = asset.fileName ?? `photo_${Date.now()}.jpg`;
    setSelectedImages((prev) => [
      ...prev,
      { uri: compressed.uri, name: filename, mimeType: compressed.mimeType },
    ]);
  };

  const handlePickFromLibrary = async () => {
    imagePickingRef.current = true;
    try {
      if (selectedImages.length >= MAX_PHOTOS) return;

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Photo library access is needed to attach images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled || !result.assets?.[0]) return;

      try {
        await processPickedAsset(result.assets[0]);
      } catch {
        Alert.alert('Unable to process image', 'Please try a different photo.');
      }
    } finally {
      imagePickingRef.current = false;
    }
  };

  const handleTakePhoto = async () => {
    imagePickingRef.current = true;
    try {
      if (selectedImages.length >= MAX_PHOTOS) return;

      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Camera access is needed to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled || !result.assets?.[0]) return;

      try {
        await processPickedAsset(result.assets[0]);
      } catch {
        Alert.alert('Unable to process image', 'Please try a different photo.');
      }
    } finally {
      imagePickingRef.current = false;
    }
  };

  const handleAddPhoto = () => {
    if (imagePickingRef.current) return;
    Alert.alert('Add Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: handleTakePhoto },
      { text: 'Choose from Library', onPress: handlePickFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const showSubmissionFeedback = useCallback(
    (variant: FeedbackVariant, title: string, message: string) => {
      const id = feedbackSeqRef.current + 1;
      feedbackSeqRef.current = id;
      const payload: FeedbackNotice = { id, variant, title, message };

      setNotificationNotice(payload);
      setToastNotice(payload);

      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
      notificationTimerRef.current = setTimeout(() => {
        notificationTimerRef.current = null;
        setNotificationNotice((prev) => (prev?.id === id ? null : prev));
      }, 2600);

      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      toastTimerRef.current = setTimeout(() => {
        toastTimerRef.current = null;
        setToastNotice((prev) => (prev?.id === id ? null : prev));
      }, 2200);
    },
    []
  );

  const handleSubmit = async () => {
    if (!isFormValid) return;

    // Fix 8: Check for empty id
    if (!id.trim()) {
      const message = 'This listing could not be identified. Please go back and try again.';
      setFormError(message);
      showSubmissionFeedback('error', 'Review submission failed', message);
      return;
    }

    const gate = guardSensitiveAction('write_review');
    if (!gate.allowed) {
      const message = gate.reason || 'This action is temporarily unavailable on this device.';
      setFormError(message);
      showSubmissionFeedback('error', 'Review submission failed', message);
      return;
    }

    // Fix 2: Create and store abort controller
    const abortController = new AbortController();
    submitAbortRef.current = abortController;

    setFormError(null);
    setSubmitting(true);
    let partialSuccessWarningMessage: string | null = null;
    let submittedReviewId: string | null = null;

    try {
      if (isEditMode && reviewId) {
        const result = await apiFetch<{ message?: string; code?: string; error?: string; success?: boolean }>(
          `/api/reviews/${reviewId}`,
          {
            method: 'PUT',
            body: JSON.stringify({
              rating,
              title: reviewTitle.trim() || null,
              content: reviewText.trim(),
              tags: selectedTags,
            }),
            timeoutMs: 20_000,
            signal: abortController.signal,
          }
        );
        if (result.success === false) {
          const message = getErrorMessage(result);
          setFormError(message);
          showSubmissionFeedback('error', 'Review update failed', message);
          return;
        }
        submittedReviewId = reviewId;
      } else if (isBusinessReview) {
        const formData = new FormData();
        formData.append('business_id', businessDetail?.id ?? id);
        formData.append('rating', String(rating));
        formData.append('content', reviewText.trim());
        if (reviewTitle.trim()) formData.append('title', reviewTitle.trim());
        selectedTags.forEach((tag) => formData.append('tags', tag));
        selectedImages.forEach((img, i) => {
          formData.append('images', {
            uri: img.uri,
            name: img.name || `photo_${Date.now()}_${i}.jpg`,
            type: img.mimeType || 'image/jpeg',
          } as unknown as Blob);
        });

        const result = await apiFetch<{ message?: string; code?: string; error?: string; success?: boolean; review?: { id: string } }>(
          '/api/reviews',
          { method: 'POST', body: formData, includeAnonymousIdOnMissingAuth: true, timeoutMs: 20_000, signal: abortController.signal }
        );
        if (result.success === false) {
          const message = getErrorMessage(result);
          const isImageUploadPartialSuccess =
            result.code === 'IMAGE_UPLOAD_FAILED' || message === REVIEW_ERROR_MESSAGES.IMAGE_UPLOAD_FAILED;
          if (isImageUploadPartialSuccess) {
            partialSuccessWarningMessage = REVIEW_ERROR_MESSAGES.IMAGE_UPLOAD_FAILED;
          } else {
            setFormError(message);
            showSubmissionFeedback('error', 'Review submission failed', message);
            return;
          }
        }
        submittedReviewId = result.review?.id ?? null;
      } else {
        const formData = new FormData();
        formData.append('target_id', id);
        formData.append('type', type);
        formData.append('rating', String(rating));
        formData.append('content', reviewText.trim());
        if (reviewTitle.trim()) formData.append('title', reviewTitle.trim());
        selectedTags.forEach((tag) => formData.append('tags', tag));
        selectedImages.forEach((img, i) => {
          formData.append('images', {
            uri: img.uri,
            name: img.name || `photo_${Date.now()}_${i}.jpg`,
            type: img.mimeType || 'image/jpeg',
          } as unknown as Blob);
        });

        const result = await apiFetch<{ message?: string; code?: string; error?: string; success?: boolean; review?: { id: string } }>(
          '/api/reviews',
          { method: 'POST', body: formData, includeAnonymousIdOnMissingAuth: true, timeoutMs: 20_000, signal: abortController.signal }
        );
        if (result.success === false) {
          const message = getErrorMessage(result);
          const isImageUploadPartialSuccess =
            result.code === 'IMAGE_UPLOAD_FAILED' || message === REVIEW_ERROR_MESSAGES.IMAGE_UPLOAD_FAILED;
          if (isImageUploadPartialSuccess) {
            partialSuccessWarningMessage = REVIEW_ERROR_MESSAGES.IMAGE_UPLOAD_FAILED;
          } else {
            setFormError(message);
            showSubmissionFeedback('error', 'Review submission failed', message);
            return;
          }
        }
        // Event/special reviews do not appear in the business reviews list,
        // so do not set submittedReviewId — the business reviews query was
        // not invalidated and the review won't be found there.
      }

      if (isBusinessReview) {
        qc.invalidateQueries({ queryKey: ['business-reviews', businessDetail?.id ?? id] });
        qc.invalidateQueries({ queryKey: ['business', businessDetail?.id ?? id] });
      } else {
        qc.invalidateQueries({ queryKey: ['event-special-detail', id] });
        qc.invalidateQueries({ queryKey: ['event-reviews', id] });
        qc.invalidateQueries({ queryKey: ['event-ratings', id] });
        qc.invalidateQueries({ queryKey: ['event-related', id] });
      }

      qc.invalidateQueries({ queryKey: ['user-reviews'] });
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['user-stats'] });

      qc.invalidateQueries({ queryKey: ['user-badges'] });
      qc.invalidateQueries({ queryKey: ['user-badges-all'] });

      // Show success feedback immediately — do not block on badge check
      const successTitle = isEditMode ? 'Review updated' : 'Review submitted';
      const successMessage = isEditMode
        ? 'Your review changes were saved.'
        : 'Thanks for sharing your experience.';
      if (partialSuccessWarningMessage) {
        showSubmissionFeedback('warning', 'Review submitted', partialSuccessWarningMessage);
      } else {
        showSubmissionFeedback('success', successTitle, successMessage);
      }

      if (!partialSuccessWarningMessage) {
        try {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          // Non-blocking celebratory haptic.
        }
      }

      if (!isEditMode && !partialSuccessWarningMessage) {
        setShowSuccessConfetti(true);
      }

      // Award badges in the background — result surfaces via push notification
      if (user?.id && !isEditMode) {
        apiFetch<{ ok?: boolean; newBadges?: UserBadgeDto[] }>(
          '/api/badges/check-and-award',
          { method: 'POST', timeoutMs: 10_000, signal: abortController.signal }
        )
          .then((badgeResult) => {
            if ((badgeResult?.newBadges ?? []).length > 0) {
              void qc.refetchQueries({ queryKey: ['user-badges', user!.id] });
            }
          })
          .catch(() => {
            // Badge check failures must never surface as a review submission error
          });
      }

      const redirectBusinessId = (() => {
        if (isBusinessReview) {
          if (typeof businessDetail?.id === 'string' && businessDetail.id.trim().length > 0) {
            return businessDetail.id;
          }
          return id;
        }

        const eventPayload = eventSpecial as Record<string, unknown> | null;
        const camelBusinessId =
          eventPayload && typeof eventPayload.businessId === 'string'
            ? eventPayload.businessId.trim()
            : '';
        if (camelBusinessId) {
          return camelBusinessId;
        }

        const snakeBusinessId =
          eventPayload && typeof eventPayload.business_id === 'string'
            ? eventPayload.business_id.trim()
            : '';
        if (snakeBusinessId) {
          return snakeBusinessId;
        }

        return null;
      })();

      const reviewParam =
        redirectBusinessId && submittedReviewId
          ? `?newReviewId=${encodeURIComponent(submittedReviewId)}`
          : '';
      const redirectTarget = redirectBusinessId
        ? routes.businessDetail(redirectBusinessId) + reviewParam
        : routes.home();

      if (successRedirectTimerRef.current) {
        clearTimeout(successRedirectTimerRef.current);
      }
      successRedirectTimerRef.current = setTimeout(() => {
        successRedirectTimerRef.current = null;
        setShowSuccessConfetti(false);
        router.replace(redirectTarget as never);
      }, reducedMotion ? 2000 : 1100);
    } catch (err) {
      if (err instanceof ApiError) {
        const details =
          err.details && typeof err.details === 'object'
            ? (err.details as Record<string, unknown>)
            : null;
        const detailsMessage =
          details && typeof details.message === 'string' ? details.message : undefined;
        const detailsError =
          details && typeof details.error === 'string' ? details.error : undefined;

        if (__DEV__) {
          console.warn('[WriteReview] submit failed', {
            status: err.status,
            code: err.code,
            requestId: err.requestId,
            details: err.details,
          });
        }

        const message = getErrorMessage({
          message: detailsMessage || err.message,
          code: err.code,
          error: detailsError,
        });
        showSubmissionFeedback('error', isEditMode ? 'Review update failed' : 'Review submission failed', message);
        setFormError(
          message
        );
        return;
      }
      const fallbackMessage = err instanceof Error ? err.message : 'Failed to submit your review.';
      showSubmissionFeedback('error', isEditMode ? 'Review update failed' : 'Review submission failed', fallbackMessage);
      setFormError(fallbackMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Resolve display values
  let displayTitle = '';
  let displayImage: string | null = null;
  let businessName: string | null = null;
  let displayDate: string | null = null;
  let displayVenue: string | null = null;
  let displayValidUntil: string | null = null;

  if (isBusinessReview && businessDetail) {
    displayTitle = businessDetail.name ?? '';
    displayImage = (businessDetail as any).image_url ?? (businessDetail as any).images?.[0] ?? (businessDetail as any).image ?? null;
  } else if (eventSpecial) {
    const es = eventSpecial as unknown as Record<string, unknown>;
    displayTitle = String(es.name ?? es.title ?? '');
    const firstArrayImage = Array.isArray(es.images) ? es.images[0] : null;
    const displayImageCandidate = es.image ?? es.imageUrl ?? es.image_url ?? firstArrayImage ?? null;
    displayImage =
      typeof displayImageCandidate === 'string' && displayImageCandidate.trim().length > 0
        ? displayImageCandidate.trim()
        : null;
    businessName = String(es.businessName ?? es.business_name ?? '') || null;
    if (type === 'event') {
      displayDate = eventSpecial.startDate ?? null;
      displayVenue = String(es.venue ?? es.venue_name ?? '') || null;
    } else {
      const vu = es.valid_until ?? es.validUntil ?? null;
      if (vu) {
        try { displayValidUntil = new Date(String(vu)).toLocaleDateString(); } catch { displayValidUntil = null; }
      }
    }
  }

  const linkedBusinessId = useMemo(() => {
    if (isBusinessReview) {
      if (typeof businessDetail?.id === 'string' && businessDetail.id.trim().length > 0) return businessDetail.id;
      return typeof id === 'string' && id.trim().length > 0 ? id : null;
    }
    const es = eventSpecial as unknown as Record<string, unknown> | null;
    const camelId = es && typeof es.businessId === 'string' ? es.businessId.trim() : '';
    if (camelId) return camelId;
    const snakeId = es && typeof es.business_id === 'string' ? es.business_id.trim() : '';
    return snakeId || null;
  }, [businessDetail?.id, eventSpecial, id, isBusinessReview]);

  const savedBusinessIds = useMemo(() => {
    const ids = ((savedQuery.data?.businesses ?? []) as Array<{ id?: string | null }>)
      .map((savedItem: { id?: string | null }) => savedItem?.id)
      .filter(
        (savedId: string | null | undefined): savedId is string =>
          typeof savedId === 'string' && savedId.trim().length > 0
      );
    return new Set(ids);
  }, [savedQuery.data?.businesses]);

  const isLinkedBusinessSaved = Boolean(linkedBusinessId && savedBusinessIds.has(linkedBusinessId));

  const handleHeaderShare = useCallback(async () => {
    const origin = ENV.apiBaseUrl || 'https://www.sayso.co.za';
    const shareTitle = displayTitle || 'Sayso';
    const targetPath = isBusinessReview
      ? routes.businessDetail((businessDetail?.id ?? id) || id)
      : type === 'special'
        ? routes.specialDetail(id)
        : routes.eventDetail(id);

    try {
      await Share.share({
        title: shareTitle,
        message: `Check out ${shareTitle} on Sayso\n${origin}${targetPath}`,
      });
    } catch {
      // Non-blocking.
    }
  }, [businessDetail?.id, displayTitle, id, isBusinessReview, type]);

  const handleHeaderSave = useCallback(async () => {
    if (!linkedBusinessId) {
      Alert.alert('Save unavailable', 'Saving is unavailable for this listing.');
      return;
    }
    if (!user) {
      router.push(routes.onboarding() as never);
      return;
    }
    if (saveBusy) return;

    setSaveBusy(true);
    try {
      if (savedBusinessIds.has(linkedBusinessId)) {
        await apiFetch<{ success?: boolean; message?: string }>(`/api/user/saved?business_id=${linkedBusinessId}`, {
          method: 'DELETE',
        });
      } else {
        await apiFetch<{ success?: boolean; message?: string }>('/api/user/saved', {
          method: 'POST',
          body: JSON.stringify({ business_id: linkedBusinessId }),
        });
      }
      await savedQuery.refetch();
    } catch (error) {
      Alert.alert(
        'Save unavailable',
        error instanceof Error ? error.message : 'Unable to update saved items right now.'
      );
    } finally {
      setSaveBusy(false);
    }
  }, [linkedBusinessId, router, saveBusy, savedBusinessIds, savedQuery, user]);

  const headerRightActions = useMemo<BusinessHeaderRightAction[]>(
    () => [
      {
        key: 'share',
        icon: 'share-social-outline',
        onPress: () => {
          void handleHeaderShare();
        },
        accessibilityLabel: 'Share listing',
      },
      {
        key: 'save',
        icon: isLinkedBusinessSaved ? 'bookmark' : 'bookmark-outline',
        onPress: () => {
          void handleHeaderSave();
        },
        accessibilityLabel: linkedBusinessId
          ? isLinkedBusinessSaved
            ? 'Unsave business'
            : 'Save business'
          : 'Save unavailable',
        disabled: saveBusy,
      },
    ],
    [handleHeaderSave, handleHeaderShare, isLinkedBusinessSaved, linkedBusinessId, saveBusy]
  );

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.safeAreaInner}>
      {!isBusinessReview && (
        <LinearGradient
          colors={['rgba(125,155,118,0.12)', C.offWhite, 'rgba(114,47,55,0.06)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
      )}
      <Stack.Screen
        options={{
          headerShown: true,
          headerShadowVisible: false,
          header: (props) => (
            <StackPageHeader {...props} onPressBack={handleBack} rightActions={headerRightActions} />
          ),
          headerStyle: { backgroundColor: C.coral },
          headerTintColor: '#FFFFFF',
        }}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >

          {/* ── Hero carousel — always shown; falls back to subcategory placeholder */}
          {!isLoading && (
            isBusinessReview && businessDetail ? (
              <BusinessHeroCarousel
                businessName={displayTitle}
                images={heroImages}
                rating={normalizeBusinessRating(businessDetail).rating}
                verified={businessDetail.verified ?? undefined}
                subcategorySlug={
                  businessDetail.primary_subcategory_slug
                    ?? (businessDetail as any).sub_interest_id
                    ?? (businessDetail as any).subInterestId
                }
                interestId={
                  (businessDetail as any).primary_category_slug
                    ?? (businessDetail as any).interest_id
                    ?? (businessDetail as any).interestId
                }
              />
            ) : (
              <ReviewHeroCarousel
                images={heroImages}
                name={displayTitle}
                subcategorySlug={undefined}
              />
            )
          )}

          {/* ── Target info card — only for events/specials (web doesn't show for business) */}
          {!isLoading && displayTitle && !isBusinessReview ? (
            <LinearGradient colors={CARD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.targetCard}>
              <View style={styles.targetRow}>
                {heroImages.length === 0 && displayImage ? (
                  <Image source={{ uri: displayImage }} style={styles.targetImg} />
                ) : heroImages.length === 0 ? (
                  <View style={styles.targetImgFallback}>
                    <Ionicons name="star-outline" size={28} color={C.charcoal30} />
                  </View>
                ) : null}
                <View style={[styles.targetInfo, heroImages.length > 0 && { flex: 1 }]}>
                  <Text style={styles.targetTitle} numberOfLines={2}>{displayTitle}</Text>
                  {businessName ? <Text style={styles.targetByLine}>by {businessName}</Text> : null}
                  <View style={styles.targetMetaRow}>
                    {displayDate ? (
                      <View style={styles.metaChip}>
                        <Ionicons name="calendar-outline" size={12} color={C.charcoal60} />
                        <Text style={styles.metaChipText}>{displayDate}</Text>
                      </View>
                    ) : null}
                    {displayVenue ? (
                      <View style={styles.metaChip}>
                        <Ionicons name="location-outline" size={12} color={C.charcoal60} />
                        <Text style={styles.metaChipText} numberOfLines={1}>{displayVenue}</Text>
                      </View>
                    ) : null}
                    {displayValidUntil ? (
                      <View style={styles.metaChip}>
                        <Ionicons name="time-outline" size={12} color={C.charcoal60} />
                        <Text style={styles.metaChipText}>Valid until {displayValidUntil}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            </LinearGradient>
          ) : null}

          {/* ── Form card entrance (matches web: opacity 0→1, y 20→0, duration 0.4s) */}
          <AnimatedLinearGradient colors={CARD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.formCard, { opacity: formOpacity, transform: [{ translateY: formTranslateY }] }]}>

          {/* ── Anonymous notice — web shows this ABOVE the form header */}
          {!user ? (
            <View style={styles.anonNotice}>
              <Text style={styles.anonTitle}>Posting as Anonymous</Text>
              <Text style={styles.anonBody}>Sign in to tie this review to your profile identity.</Text>
            </View>
          ) : null}

          {/* ── Form header */}
          <View style={styles.formHeader}>
            <Ionicons name="create-outline" size={20} color={C.coral} />
            <View style={styles.formHeaderText}>
              <Text style={styles.formHeaderTitle}>{isEditMode ? 'Edit Review' : 'Write a Review'}</Text>
              {displayTitle ? (
                <Text style={styles.formHeaderSub}>
                  {isEditMode ? `Update your experience with ${displayTitle}` : `Share your experience with ${displayTitle}`}
                </Text>
              ) : null}
            </View>
          </View>
          {existingReviewLoading ? (
            <Text style={styles.prefillLabel}>Loading your existing review...</Text>
          ) : null}

          {/* ── Rating — stagger delay 100ms, slide from x:-20 */}
          <Animated.View style={[styles.section, { opacity: sectionAnims[0].opacity, transform: [{ translateX: sectionAnims[0].translateX }] }]}>
            <RatingSelector value={rating} onChange={(v) => { setFormError(null); setRating(v); }} disabled={controlsDisabled} />
          </Animated.View>

          <Divider />

          {/* ── Tags — stagger delay 150ms */}
          <Animated.View style={[styles.section, { opacity: sectionAnims[1].opacity, transform: [{ translateX: sectionAnims[1].translateX }] }]}>
            <TagSelector
              tags={effectiveQuickTags} selected={selectedTags}
              onToggle={(tag) => { setFormError(null); handleTagToggle(tag); }}
              disabled={controlsDisabled}
            />
          </Animated.View>

          <Divider />

          {/* ── Title — stagger delay 200ms, focus scale 1→1.01 */}
          <Animated.View style={[styles.section, { opacity: sectionAnims[2].opacity, transform: [{ translateX: sectionAnims[2].translateX }] }]}>
            <View style={styles.fieldHeaderRow}>
              <View style={styles.fieldHeader}>
                <Ionicons name="text-outline" size={16} color={C.charcoal60} />
                <Text style={styles.fieldLabel}>Title <Text style={styles.fieldOptional}>(optional)</Text></Text>
              </View>
            </View>
            <Animated.View style={{ transform: [{ scale: titleScale }] }}>
              <TextInput
                style={styles.titleInput} value={reviewTitle}
                onChangeText={(t) => { setFormError(null); setReviewTitle(t); }}
                onFocus={() => setTitleFocused(true)} onBlur={() => setTitleFocused(false)}
                placeholder="Summarize your experience..." placeholderTextColor={C.charcoal30}
                maxLength={MAX_TITLE_CHARS} editable={!controlsDisabled}
              />
            </Animated.View>
            <Text style={styles.charCount}>{reviewTitle.length}/{MAX_TITLE_CHARS}</Text>
          </Animated.View>

          {/* ── Body — stagger delay 200ms, focus scale 1→1.01 */}
          <Animated.View style={[styles.section, { opacity: sectionAnims[3].opacity, transform: [{ translateX: sectionAnims[3].translateX }] }]}>
            <View style={styles.fieldHeaderRow}>
              <View style={styles.fieldHeader}>
                <Ionicons name="chatbubble-outline" size={16} color={C.charcoal60} />
                <Text style={styles.fieldLabel}>Your review</Text>
              </View>
              <Text style={[styles.charCount, charCount > 4500 && styles.charCountWarn]}>{charCount}/{MAX_CHARS}</Text>
            </View>
            <Animated.View style={[{ position: 'relative' }, { transform: [{ scale: bodyScale }] }]}>
              <TextInput
                style={styles.bodyInput} value={reviewText}
                onChangeText={(t) => { setFormError(null); setReviewText(t); }}
                onFocus={() => setTextFocused(true)} onBlur={() => setTextFocused(false)}
                placeholder="Share your experience with others..." placeholderTextColor={C.charcoal30}
                multiline textAlignVertical="top" maxLength={MAX_CHARS} editable={!controlsDisabled}
              />
              {reviewText.length === 0 && !textFocused ? (
                <AnimatedTip promptIndex={promptIndex} reducedMotion={reducedMotion} />
              ) : null}
            </Animated.View>
            {showValidation ? (
              <Animated.View style={{ opacity: validationOpacity, transform: [{ translateY: validationTranslateY }] }}>
                <Text style={styles.minCharsHint}>
                  {MIN_CHARS - reviewText.trim().length} more character{MIN_CHARS - reviewText.trim().length !== 1 ? 's' : ''} needed
                </Text>
                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <Animated.View style={[styles.progressFill, { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
                  </View>
                </View>
              </Animated.View>
            ) : null}
          </Animated.View>

          {!isEditMode && <Divider />}

          {!isEditMode && (
            /* ── Photos — stagger delay 250ms */
            <Animated.View style={[styles.section, { opacity: sectionAnims[4].opacity, transform: [{ translateX: sectionAnims[4].translateX }] }]}>
              <View style={styles.fieldHeaderRow}>
                <View style={styles.fieldHeader}>
                  <Ionicons name="camera-outline" size={16} color={C.charcoal60} />
                  <Text style={styles.fieldLabel}>Photos <Text style={styles.fieldOptional}>(optional)</Text></Text>
                </View>
                {selectedImages.length > 0 ? <Text style={styles.charCount}>{selectedImages.length}/{MAX_PHOTOS}</Text> : null}
              </View>
              {selectedImages.length > 0 ? (
                <View style={styles.photosRow}>
                  {selectedImages.map((img, i) => (
                    <View key={i} style={styles.photoThumb}>
                      <Image source={{ uri: img.uri }} style={styles.photoImg} />
                      <Pressable style={styles.photoRemoveBtn} onPress={() => handleRemoveImage(i)} disabled={controlsDisabled}>
                        <Ionicons name="close-outline" size={11} color={C.white} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : null}
              {selectedImages.length < MAX_PHOTOS ? (
                <Pressable style={styles.photoPickerZone} onPress={handleAddPhoto} disabled={controlsDisabled}>
                  <View style={styles.photoPickerIcon}>
                    <Ionicons name="image-outline" size={22} color={C.charcoal60} />
                  </View>
                  <Text style={styles.photoPickerLabel}>Tap to add photos</Text>
                  <Text style={styles.photoPickerSub}>
                    {selectedImages.length > 0 ? `${selectedImages.length}/${MAX_PHOTOS} added` : `Up to ${MAX_PHOTOS} images, max 2MB each`}
                  </Text>
                </Pressable>
              ) : null}
            </Animated.View>
          )}

          {/* ── Error */}
          {formError ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color={C.coral} />
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          ) : null}

          {/* ── Submit — stagger delay 300ms */}
          <Animated.View style={[styles.submitWrap, { opacity: sectionAnims[5].opacity, transform: [{ translateY: sectionAnims[5].translateX }] }]}>
            <Pressable testID="submit-review-btn" onPress={handleSubmit} disabled={!isFormValid} style={{ width: '100%' }}>
              {isFormValid ? (
                <LinearGradient colors={[C.coral, 'rgba(114,47,55,0.90)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitBtn}>
                  <Text style={styles.submitText}>
                    {submitting ? (isEditMode ? 'Saving...' : 'Submitting...') : (isEditMode ? 'Save Changes' : 'Submit Review')}
                  </Text>
                  {!submitting ? <Ionicons name="send-outline" size={16} color={C.white} /> : null}
                </LinearGradient>
              ) : (
                <View style={[styles.submitBtn, styles.submitBtnDisabled]}>
                  <Text style={[styles.submitText, styles.submitTextDisabled]}>
                    {isEditMode ? 'Save Changes' : 'Submit Review'}
                  </Text>
                </View>
              )}
            </Pressable>
            {!isFormValid ? (
              <Text style={styles.invalidHint}>
                {isEditMode
                  ? 'Add a rating and at least 10 characters to save'
                  : 'Add a rating and at least 10 characters to submit'}
              </Text>
            ) : null}
          </Animated.View>

          </AnimatedLinearGradient>{/* end formCard */}

          {/* ── What others are saying */}
          <CommunityReviewsSection reviews={communityReviews} isLoading={communityReviewsLoading} />

          {/* ── Context card (mobile equivalent of web sidebar) */}
          {!isLoading && displayTitle && !isBusinessReview ? (
            <LinearGradient colors={CARD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.contextCard}>
              <Text style={styles.contextHeading}>
                {type === 'event' ? 'About this Event' : 'About this Special'}
              </Text>

              {displayImage ? (
                <Image source={{ uri: displayImage }} style={styles.contextImage} resizeMode="cover" />
              ) : (
                <View style={styles.contextImageFallback}>
                  <Ionicons name="image-outline" size={28} color={C.charcoal45} />
                </View>
              )}

              <Text style={styles.contextTitle} numberOfLines={2}>{displayTitle}</Text>
              {businessName ? <Text style={styles.contextSub}>by {businessName}</Text> : null}

              <View style={styles.contextMetaWrap}>
                {displayDate ? <Text style={styles.contextMetaText}>{displayDate}</Text> : null}
                {displayVenue ? <Text style={styles.contextMetaText}>{displayVenue}</Text> : null}
                {displayValidUntil ? <Text style={styles.contextMetaText}>Valid until {displayValidUntil}</Text> : null}
              </View>
            </LinearGradient>
          ) : null}

        </ScrollView>
      </KeyboardAvoidingView>
      <ReviewConfettiOverlay visible={showSuccessConfetti} />
      {notificationNotice ? (
        <View
          pointerEvents="none"
          style={[
            styles.reviewStatusNotice,
            notificationNotice.variant === 'success'
              ? styles.reviewStatusNoticeSuccess
              : notificationNotice.variant === 'warning'
                ? styles.reviewStatusNoticeWarning
                : styles.reviewStatusNoticeError,
          ]}
        >
          <Ionicons
            name={
              notificationNotice.variant === 'success'
                ? 'checkmark-circle-outline'
                : notificationNotice.variant === 'warning'
                  ? 'warning-outline'
                  : 'alert-circle-outline'
            }
            size={16}
            color={
              notificationNotice.variant === 'success'
                ? '#1F5133'
                : notificationNotice.variant === 'warning'
                  ? '#6B3F1D'
                  : '#722F37'
            }
          />
          <Text style={styles.reviewStatusNoticeTitle}>{notificationNotice.title}</Text>
        </View>
      ) : null}
      {toastNotice ? (
        <View
          pointerEvents="none"
          style={[
            styles.reviewStatusToast,
            toastNotice.variant === 'success'
              ? styles.reviewStatusToastSuccess
              : toastNotice.variant === 'warning'
                ? styles.reviewStatusToastWarning
                : styles.reviewStatusToastError,
          ]}
        >
          <Text
            style={[
              styles.reviewStatusToastTitle,
              toastNotice.variant === 'success'
                ? styles.reviewStatusToastTitleSuccess
                : toastNotice.variant === 'warning'
                  ? styles.reviewStatusToastTitleWarning
                  : styles.reviewStatusToastTitleError,
            ]}
          >
            {toastNotice.title}
          </Text>
          <Text
            style={[
              styles.reviewStatusToastMessage,
              toastNotice.variant === 'success'
                ? styles.reviewStatusToastMessageSuccess
                : toastNotice.variant === 'warning'
                  ? styles.reviewStatusToastMessageWarning
                  : styles.reviewStatusToastMessageError,
            ]}
          >
            {toastNotice.message}
          </Text>
        </View>
      ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.coral },
  safeAreaInner: { flex: 1, backgroundColor: C.offWhite },
  confettiOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 60,
    overflow: 'hidden',
  },
  confettiPiece: {
    position: 'absolute',
    top: -20,
  },
  reviewStatusNotice: {
    position: 'absolute',
    top: 12,
    left: 14,
    right: 14,
    zIndex: 70,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewStatusNoticeSuccess: {
    backgroundColor: 'rgba(157,171,155,0.96)',
    borderColor: 'rgba(31,81,51,0.25)',
  },
  reviewStatusNoticeWarning: {
    backgroundColor: 'rgba(255,209,102,0.95)',
    borderColor: 'rgba(212,145,92,0.34)',
  },
  reviewStatusNoticeError: {
    backgroundColor: 'rgba(229,224,229,0.98)',
    borderColor: 'rgba(114,47,55,0.26)',
  },
  reviewStatusNoticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  reviewStatusToast: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 18,
    zIndex: 70,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  reviewStatusToastSuccess: {
    backgroundColor: 'rgba(157,171,155,0.98)',
    borderColor: 'rgba(31,81,51,0.30)',
  },
  reviewStatusToastWarning: {
    backgroundColor: 'rgba(255,209,102,0.96)',
    borderColor: 'rgba(212,145,92,0.34)',
  },
  reviewStatusToastError: {
    backgroundColor: 'rgba(114,47,55,0.95)',
    borderColor: 'rgba(255,255,255,0.16)',
  },
  reviewStatusToastTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  reviewStatusToastTitleSuccess: {
    color: '#1F5133',
  },
  reviewStatusToastTitleWarning: {
    color: '#6B3F1D',
  },
  reviewStatusToastTitleError: {
    color: '#FFFFFF',
  },
  reviewStatusToastMessage: {
    fontSize: 12,
    lineHeight: 17,
  },
  reviewStatusToastMessageSuccess: {
    color: 'rgba(45,45,45,0.86)',
  },
  reviewStatusToastMessageWarning: {
    color: 'rgba(45,45,45,0.86)',
  },
  reviewStatusToastMessageError: {
    color: 'rgba(255,255,255,0.92)',
  },
  formCard: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
    ...cardShadowStyle,
  } as object,
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 48, gap: 16 },

  formHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 4, paddingTop: 16, marginBottom: 4 },
  formHeaderText: { flex: 1, gap: 2 },
  formHeaderTitle: { fontSize: 20, fontWeight: '700', color: C.charcoal },
  formHeaderSub: { fontSize: 14, color: C.charcoal60 },
  prefillLabel: { fontSize: 12, color: C.charcoal60, paddingHorizontal: 4, marginBottom: 8 },

  targetCard: { borderRadius: 12, padding: 16, ...cardShadowStyle } as object,
  targetRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  targetImg: { width: 72, height: 72, borderRadius: 10, flexShrink: 0 },
  targetImgFallback: { width: 72, height: 72, borderRadius: 10, backgroundColor: C.charcoal10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  targetInfo: { flex: 1, gap: 4 },
  targetTitle: { fontSize: 17, fontWeight: '700', color: C.charcoal, lineHeight: 22 },
  targetByLine: { fontSize: 13, fontWeight: '500', color: C.charcoal60 },
  targetMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaChipText: { fontSize: 12, fontWeight: '500', color: C.charcoal60 },

  anonNotice: { marginBottom: 16, backgroundColor: 'rgba(125,155,118,0.08)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(125,155,118,0.20)', padding: 12, gap: 2 },
  anonTitle: { fontSize: 14, fontWeight: '700', color: C.charcoal },
  anonBody: { fontSize: 13, fontWeight: '500', color: C.charcoal60 },

  section: { paddingVertical: 20 },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fieldHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 },
  fieldLabel: { fontSize: 16, fontWeight: '600', color: C.charcoal },
  fieldOptional: { fontSize: 14, fontWeight: '400', color: 'rgba(45,45,45,0.45)' },

  titleInput: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 999, borderWidth: 2, borderColor: 'rgba(255,255,255,0.60)', paddingHorizontal: 20, paddingVertical: 14, fontSize: 15, fontWeight: '600', color: C.charcoal },
  bodyInput: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.60)', paddingHorizontal: 20, paddingVertical: 16, fontSize: 15, fontWeight: '500', color: C.charcoal, minHeight: 120, lineHeight: 22 },

  tipOverlay: { position: 'absolute', bottom: 16, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', gap: 6 },
  tipText: { fontSize: 13, color: C.charcoal60, flexShrink: 1 },

  progressRow: { marginTop: 8 },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2, backgroundColor: 'rgba(114,47,55,0.60)' },
  charCount: { fontSize: 12, color: 'rgba(45,45,45,0.45)', textAlign: 'right', marginTop: 4 },
  charCountWarn: { color: '#E88D67' },
  minCharsHint: { fontSize: 12, color: C.coral, marginTop: 6, paddingHorizontal: 4 },

  photosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  photoThumb: { width: 80, height: 80, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  photoImg: { width: 80, height: 80 },
  photoRemoveBtn: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: C.coral, alignItems: 'center', justifyContent: 'center' },
  photoPickerZone: { borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(45,45,45,0.20)', borderRadius: 12, paddingVertical: 24, paddingHorizontal: 16, alignItems: 'center', gap: 6, backgroundColor: C.charcoal10, marginTop: 12 },
  photoPickerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(45,45,45,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  photoPickerLabel: { fontSize: 15, fontWeight: '600', color: C.charcoal60 },
  photoPickerSub: { fontSize: 13, fontWeight: '400', color: 'rgba(45,45,45,0.45)' },

  errorBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 12, backgroundColor: C.errorBg, borderWidth: 1, borderColor: C.errorBorder, marginTop: 24 },
  errorText: { flex: 1, fontSize: 14, fontWeight: '500', color: C.coral, lineHeight: 20 },

  submitWrap: { marginTop: 32, gap: 12, alignItems: 'center' },
  submitBtn: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 999, minHeight: 56 },
  submitBtnDisabled: { backgroundColor: C.charcoal10 },
  submitText: { fontSize: 16, fontWeight: '700', color: C.white },
  submitTextDisabled: { color: C.charcoal60 },
  invalidHint: { fontSize: 13, color: 'rgba(45,45,45,0.45)', textAlign: 'center' },

  contextCard: {
    borderRadius: 12,
    padding: 16,
    gap: 8,
    ...cardShadowStyle,
  } as object,
  contextHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: C.charcoal,
    marginBottom: 2,
  },
  contextImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
  },
  contextImageFallback: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    backgroundColor: C.charcoal10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.charcoal,
    marginTop: 4,
  },
  contextSub: {
    fontSize: 13,
    color: C.charcoal60,
  },
  contextMetaWrap: {
    gap: 4,
    marginTop: 2,
  },
  contextMetaText: {
    fontSize: 12,
    color: C.charcoal60,
    lineHeight: 18,
  },
});
