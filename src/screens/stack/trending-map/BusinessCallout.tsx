import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/Typography';
import type { MappedBusiness } from './types';
import { calloutStyles } from './styles';

function StarRow({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <View style={calloutStyles.stars}>
      {[1, 2, 3, 4, 5].map((index) => (
        <Ionicons
          key={index}
          name={index <= rounded ? 'star' : 'star-outline'}
          size={12}
          color={index <= rounded ? '#F5D547' : '#D1D5DB'}
        />
      ))}
    </View>
  );
}

type Props = {
  business: MappedBusiness;
  onClose: () => void;
  onView: () => void;
};

export function BusinessCallout({ business, onClose, onView }: Props) {
  const slideAnim = useSharedValue(80);
  const opacityAnim = useSharedValue(0);

  useEffect(() => {
    slideAnim.value = withSpring(0, { stiffness: 260, damping: 22 });
    opacityAnim.value = withTiming(1, { duration: 180 });
  }, [opacityAnim, slideAnim]);

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateY: slideAnim.value }],
      opacity: opacityAnim.value,
    }),
    [opacityAnim, slideAnim]
  );

  const rating = business.rating ?? 0;
  const reviews = business.reviews ?? 0;

  return (
    <Animated.View style={[calloutStyles.card, animatedStyle]}>
      <Pressable style={calloutStyles.dismissZone} onPress={onClose} />

      <View style={calloutStyles.inner}>
        <View style={calloutStyles.handleBar} />

        <View style={calloutStyles.row}>
          <View style={calloutStyles.info}>
            <Text style={calloutStyles.name} numberOfLines={1}>
              {business.name}
            </Text>

            <View style={calloutStyles.metaRow}>
              {rating > 0 ? (
                <>
                  <StarRow rating={rating} />
                  <Text style={calloutStyles.ratingText}>{rating.toFixed(1)}</Text>
                  {reviews > 0 ? <Text style={calloutStyles.reviewsText}>({reviews})</Text> : null}
                  <View style={calloutStyles.dot} />
                </>
              ) : null}
              {business.category_label ?? business.category ? (
                <Text style={calloutStyles.category} numberOfLines={1}>
                  {business.category_label ?? business.category}
                </Text>
              ) : null}
            </View>

            {business.location ?? business.address ? (
              <Text style={calloutStyles.address} numberOfLines={1}>
                {business.location ?? business.address}
              </Text>
            ) : null}
          </View>

          <Pressable style={calloutStyles.viewBtn} onPress={onView} accessibilityLabel="View business">
            <Text style={calloutStyles.viewBtnText}>View</Text>
            <Ionicons name="arrow-forward-outline" size={14} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}
