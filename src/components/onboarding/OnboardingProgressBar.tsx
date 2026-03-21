import { Animated, View } from 'react-native';
import { styles } from './onboardingLayoutStyles';

type Props = {
  progressPercentage: number;
  progressScaleX: Animated.Value;
};

export function OnboardingProgressBar({ progressPercentage, progressScaleX }: Props) {
  return (
    <View style={styles.topProgressTrack}>
      <Animated.View
        style={[
          styles.topProgressFill,
          {
            width: `${progressPercentage}%`,
            transform: [{ scaleX: progressScaleX }],
          },
        ]}
      />
    </View>
  );
}
