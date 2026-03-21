import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './constants';
import { styles } from './styles';

type Props = {
  rating: number;
  size?: number;
};

export function StarRating({ rating, size = 14 }: Props) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((index) => (
        <Ionicons
          key={index}
          name={index <= Math.round(rating) ? 'star' : 'star-outline'}
          size={size}
          color={C.wine}
        />
      ))}
    </View>
  );
}
