import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TransitionItem } from '../../../components/motion/TransitionItem';
import { Text } from '../../../components/Typography';
import { businessDetailColors } from '../../../components/business-detail/styles';
import { styles } from './trendingStyles';

type Props = {
  isMapMode: boolean;
  onSetMapMode: (isMap: boolean) => void;
};

export function ViewModeToggle({ isMapMode, onSetMapMode }: Props) {
  return (
    <TransitionItem role="support" index={4}>
      <View style={styles.toggleRow}>
        <View style={styles.togglePill}>
          <Pressable
            style={[styles.toggleBtn, !isMapMode && styles.toggleBtnActiveList]}
            onPress={() => onSetMapMode(false)}
          >
            <Ionicons
              name="list-outline"
              size={14}
              color={!isMapMode ? businessDetailColors.white : businessDetailColors.charcoal}
            />
            <Text style={[styles.toggleBtnText, !isMapMode ? styles.toggleBtnTextActive : styles.toggleBtnTextInactive]}>
              List
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, isMapMode && styles.toggleBtnActiveMap]}
            onPress={() => onSetMapMode(true)}
          >
            <Ionicons
              name="map-outline"
              size={14}
              color={isMapMode ? businessDetailColors.white : businessDetailColors.charcoal}
            />
            <Text style={[styles.toggleBtnText, isMapMode ? styles.toggleBtnTextActive : styles.toggleBtnTextInactive]}>
              Map
            </Text>
          </Pressable>
        </View>
      </View>
    </TransitionItem>
  );
}
