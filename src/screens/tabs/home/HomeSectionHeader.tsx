import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/Typography';
import { homeTokens } from './HomeTokens';

type Props = {
  title: string;
  actionLabel?: string;
  onPress?: () => void;
};

export function HomeSectionHeader({ title, actionLabel, onPress }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>

      {actionLabel && onPress ? (
        <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.8}>
          <Text style={styles.action}>{actionLabel}</Text>
          <Ionicons name="arrow-forward-outline" size={14} color={homeTokens.coral} style={styles.actionArrow} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: homeTokens.pageGutter,
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: homeTokens.charcoal,
    letterSpacing: -0.5,
  },
  action: {
    fontSize: 13,
    fontWeight: '700',
    color: homeTokens.coral,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    paddingHorizontal: 6,
    gap: 4,
  },
  actionArrow: {
    marginTop: 1,
  },
});
