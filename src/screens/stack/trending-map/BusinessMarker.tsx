import { Pressable, View } from 'react-native';
import { styles } from './styles';

type Props = {
  isSelected: boolean;
  onPress: () => void;
};

export function BusinessMarker({ isSelected, onPress }: Props) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <View style={[styles.pinMarkerWrap, isSelected && styles.pinMarkerWrapSelected]}>
        <View style={[styles.pinAura, isSelected && styles.pinAuraSelected]} />
        <View style={[styles.pin, isSelected && styles.pinSelected]}>
          <View style={styles.pinCore} />
        </View>
      </View>
    </Pressable>
  );
}
