import type { ReactElement } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

type RenderCardParams<T> = {
  item: T;
  index: number;
};

type Props<T> = {
  data: T[];
  itemWidth: number;
  gap: number;
  trailingSpacer: number;
  reducedMotion: boolean;
  renderCard: (params: RenderCardParams<T>) => ReactElement;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

type PanGestureWithOffset = {
  activeOffsetX: (offset: [number, number]) => PanGestureWithOffset;
};

function isPanGestureWithOffset(gesture: unknown): gesture is PanGestureWithOffset {
  if (gesture == null || typeof gesture !== 'object') return false;
  return typeof (gesture as { activeOffsetX?: unknown }).activeOffsetX === 'function';
}

export function HomeNativeCarousel<T>({
  data,
  itemWidth,
  gap,
  trailingSpacer,
  reducedMotion,
  renderCard,
  style,
  containerStyle,
  testID,
}: Props<T>) {
  const itemSize = itemWidth + gap;
  const paddingRight = Math.max(trailingSpacer - gap, 0);

  return (
    <Carousel
      testID={testID}
      data={data}
      width={itemSize}
      itemWidth={itemSize}
      loop={false}
      autoPlay={false}
      enabled={data.length > 1}
      snapEnabled
      pagingEnabled={false}
      style={[style, containerStyle, { paddingRight }]}
      renderItem={({ item, index }) => (
        <View style={{ width: itemSize, paddingRight: gap }}>{renderCard({ item, index })}</View>
      )}
      customAnimation={
        reducedMotion
          ? undefined
          : (value) => {
              'worklet';
              const distance = Math.min(1, Math.abs(value));
              const scale = 1 - distance * 0.08;
              const opacity = 1 - distance * 0.3;

              return {
                transform: [{ scale }],
                opacity,
              };
            }
      }
      onConfigurePanGesture={(gesture) => {
        if (!isPanGestureWithOffset(gesture)) return;
        gesture.activeOffsetX([-10, 10]);
      }}
    />
  );
}
