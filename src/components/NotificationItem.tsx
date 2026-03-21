import { useEffect, useRef } from 'react';
import { PanResponder, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, cancelAnimation } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import type { NotificationDto } from '@sayso/contracts';
import { CARD_BG_COLOR, NAVBAR_BG_COLOR } from '../styles/colors';
import { haptics } from '../lib/haptics';
import { businessDetailColors } from './business-detail/styles';
import { Text } from './Typography';
import { APP_PAGE_GUTTER } from '../styles/layout';

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  review: 'star',
  business: 'storefront',
  badge_earned: 'ribbon',
  review_helpful: 'thumbs-up',
  claim_approved: 'checkmark-circle',
  business_approved: 'checkmark-circle',
  comment_reply: 'chatbubble',
  milestone_achievement: 'trophy',
  message: 'mail',
  dm: 'chatbubble',
};

const DELETE_REVEAL = 72;

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

type Props = {
  notification: NotificationDto;
  onPress?: () => void;
  onDismiss?: () => Promise<void>;
};

export function NotificationItem({ notification, onPress, onDismiss }: Props) {
  const icon = TYPE_ICONS[notification.type] ?? 'notifications';
  const isRead =
    typeof notification.read === 'boolean'
      ? notification.read
      : Boolean((notification as NotificationDto & { read_at?: string | null }).read_at);
  const translateX = useSharedValue(0);
  const isRevealed = useRef(false);

  // Reset swipe state if this component instance is recycled for a different item.
  useEffect(() => {
    cancelAnimation(translateX);
    translateX.value = 0;
    isRevealed.current = false;
  }, [notification.id, translateX]);

  const snapBack = () => {
    isRevealed.current = false;
    translateX.value = withSpring(0, { stiffness: 56, damping: 7 });
  };

  const snapReveal = () => {
    isRevealed.current = true;
    translateX.value = withSpring(-DELETE_REVEAL, { stiffness: 56, damping: 7 });
  };

  const panResponder = useRef(
    PanResponder.create({
      // Only claim the responder when horizontal movement is dominant.
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,
      onPanResponderMove: (_, gs) => {
        const base = isRevealed.current ? -DELETE_REVEAL : 0;
        const next = base + gs.dx;
        translateX.value = Math.max(Math.min(next, 0), -DELETE_REVEAL);
      },
      onPanResponderRelease: (_, gs) => {
        const base = isRevealed.current ? -DELETE_REVEAL : 0;
        const final = base + gs.dx;
        if (final < -(DELETE_REVEAL / 2)) {
          snapReveal();
        } else {
          snapBack();
        }
      },
      onPanResponderTerminate: () => snapBack(),
    })
  ).current;

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }), []);

  const handlePress = () => {
    if (isRevealed.current) {
      snapBack();
      return;
    }
    haptics.tap();
    onPress?.();
  };

  const handleDelete = async () => {
    if (!onDismiss) return;
    haptics.tap();
    try {
      await onDismiss();
      // On success query invalidation removes the item — no manual animation needed.
    } catch {
      snapBack();
    }
  };

  // Solid background required so the sliding content covers the delete area.
  const itemBg = isRead ? '#ffffff' : 'rgba(255,255,255,0.60)';

  return (
    <View style={styles.wrapper}>
      {/* Delete action sits behind, revealed by leftward slide. */}
      <View style={styles.deleteArea}>
        <Pressable
          style={styles.deleteButton}
          onPress={() => { void handleDelete(); }}
          accessibilityLabel="Dismiss notification"
          accessibilityRole="button"
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
        </Pressable>
      </View>

      <Animated.View
        style={[styles.slide, { backgroundColor: itemBg }, slideStyle]}
        {...panResponder.panHandlers}
      >
        <Pressable
          style={styles.pressable}
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel={notification.title}
        >
          <View style={styles.iconWrap}>
            <Ionicons
              testID={`icon-${notification.type}`}
              name={icon}
              size={20}
              color={businessDetailColors.charcoal}
            />
          </View>
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={1}>{notification.title}</Text>
            <Text style={styles.message} numberOfLines={2}>{notification.message}</Text>
            <Text style={styles.time}>{timeAgo(notification.created_at)}</Text>
          </View>
          {!isRead && <View testID="unread-dot" style={styles.dot} />}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(45,45,45,0.08)',
  },
  deleteArea: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DELETE_REVEAL,
    backgroundColor: NAVBAR_BG_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slide: {
    // backgroundColor set inline per read state.
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: APP_PAGE_GUTTER,
    paddingVertical: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CARD_BG_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: businessDetailColors.charcoal,
  },
  message: {
    fontSize: 13,
    color: businessDetailColors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  time: {
    fontSize: 12,
    color: businessDetailColors.textSubtle,
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: NAVBAR_BG_COLOR,
    marginTop: 8,
    marginLeft: 8,
    flexShrink: 0,
  },
});
