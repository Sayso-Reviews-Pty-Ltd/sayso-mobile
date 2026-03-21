import { Animated } from 'react-native';
import { Text } from '../Typography';
import { styles } from './onboardingLayoutStyles';

type Props = {
  displayTitle: string;
  subtitle: string;
  titleOpacity: Animated.Value;
  titleY: Animated.Value;
  subtitleOpacity: Animated.Value;
  subtitleY: Animated.Value;
  titleFontSize: number;
  titleLineHeight: number;
  subtitleFontSize: number;
  subtitleLineHeight: number;
};

export function OnboardingHeader({
  displayTitle,
  subtitle,
  titleOpacity,
  titleY,
  subtitleOpacity,
  subtitleY,
  titleFontSize,
  titleLineHeight,
  subtitleFontSize,
  subtitleLineHeight,
}: Props) {
  return (
    <Animated.View style={styles.header}>
      <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleY }] }}>
        <Text style={[styles.title, { fontSize: titleFontSize, lineHeight: titleLineHeight }]}>
          {displayTitle}
        </Text>
      </Animated.View>
      <Animated.View style={{ opacity: subtitleOpacity, transform: [{ translateY: subtitleY }] }}>
        <Text style={[styles.subtitle, { fontSize: subtitleFontSize, lineHeight: subtitleLineHeight }]}>
          {subtitle}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
