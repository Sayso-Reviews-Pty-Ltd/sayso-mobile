import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { Text } from '../../../components/Typography';
import { styles } from './styles';

export function ProgressRing({ percentage }: { percentage: number }) {
  const animPct = useRef(new Animated.Value(0)).current;
  const [displayPct, setDisplayPct] = useState(0);

  useEffect(() => {
    Animated.timing(animPct, {
      toValue: percentage,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const id = animPct.addListener(({ value }) => setDisplayPct(Math.round(value)));
    return () => animPct.removeListener(id);
  }, [percentage, animPct]);

  const SIZE = 160;
  const STROKE = 10;
  const INNER = SIZE - STROKE * 2;

  const fillRotation = animPct.interpolate({
    inputRange: [0, 100],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.ringContainer, { width: SIZE, height: SIZE }]}> 
      <View
        style={[
          styles.ringTrack,
          {
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            borderWidth: STROKE,
          },
        ]}
      />
      <View style={[styles.ringClipLeft, { width: SIZE / 2, height: SIZE }]}> 
        <Animated.View
          style={[
            styles.ringHalf,
            {
              width: SIZE,
              height: SIZE,
              borderRadius: SIZE / 2,
              borderWidth: STROKE,
              transform: [{ rotate: fillRotation }],
            },
          ]}
        />
      </View>
      <View style={[styles.ringCenter, { width: INNER, height: INNER, borderRadius: INNER / 2 }]}> 
        <Text style={styles.ringPct}>{displayPct}%</Text>
        <Text style={styles.ringLabel}>complete</Text>
      </View>
    </View>
  );
}
