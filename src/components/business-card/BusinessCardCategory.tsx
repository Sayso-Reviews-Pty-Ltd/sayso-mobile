import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../Typography';
import { getCategoryIconName } from './businessCardUtils';

type Props = {
  category: string;
  subInterestId?: string;
  subInterestLabel?: string;
};

export function BusinessCardCategory({ category, subInterestId, subInterestLabel }: Props) {
  const iconName = getCategoryIconName(category, subInterestId, subInterestLabel);

  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name={iconName} size={14} color="rgba(17, 24, 39, 0.7)" />
      </View>
      <Text numberOfLines={1} style={styles.label}>
        {category}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    maxWidth: '100%',
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  label: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(17, 24, 39, 0.8)',
    textAlign: 'center',
  },
});
