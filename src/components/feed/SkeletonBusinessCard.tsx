import { View, type StyleProp, type ViewStyle } from 'react-native';
import { SkeletonCard } from '../SkeletonCard';

type Props = {
  style?: StyleProp<ViewStyle>;
};

export function SkeletonBusinessCard({ style }: Props) {
  return (
    <View style={style}>
      <SkeletonCard />
    </View>
  );
}
