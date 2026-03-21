import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { ONBOARDING_TOKENS } from '../../../components/onboarding/onboardingTheme';
import { Text } from '../../../components/Typography';
import { MAX } from './constants';
import { styles } from './styles';

type Props = {
  counterAnimStyle: object;
  helperText: string;
  selectedCount: number;
};

export function FooterCta({ counterAnimStyle, helperText, selectedCount }: Props) {
  return (
    <Animated.View style={[styles.counterWrap, counterAnimStyle]}>
      <View style={[styles.counterPill, selectedCount > 0 && styles.counterPillReady]}>
        <Text style={styles.counterText}>{selectedCount} of {MAX} selected</Text>
        {selectedCount > 0 ? (
          <Ionicons name="checkmark-circle-outline" size={15} color={ONBOARDING_TOKENS.sage} />
        ) : null}
      </View>
      <Text style={styles.counterHint}>{helperText}</Text>
    </Animated.View>
  );
}
