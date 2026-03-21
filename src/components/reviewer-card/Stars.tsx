import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './theme';

type Props = {
  rating: number;
  size?: number;
};

export function Stars({ rating, size = 12 }: Props) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= Math.round(rating) ? 'star' : 'star-outline'}
          size={size}
          color={i <= Math.round(rating) ? C.coral : C.charcoal20}
        />
      ))}
    </View>
  );
}
