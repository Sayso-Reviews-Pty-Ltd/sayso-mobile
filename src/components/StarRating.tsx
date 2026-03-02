import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
};

export function StarRating({ value, onChange, size = 28 }: Props) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) =>
        onChange ? (
          <TouchableOpacity key={star} onPress={() => onChange(star)} activeOpacity={0.7}>
            <Ionicons
              name={star <= value ? 'star' : 'star-outline'}
              size={size}
              color={star <= value ? '#F59E0B' : '#D1D5DB'}
            />
          </TouchableOpacity>
        ) : (
          <Ionicons
            key={star}
            name={star <= value ? 'star' : 'star-outline'}
            size={size}
            color={star <= value ? '#F59E0B' : '#D1D5DB'}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
});
