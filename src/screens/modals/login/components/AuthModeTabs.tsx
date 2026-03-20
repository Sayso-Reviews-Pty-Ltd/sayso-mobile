import { Animated, LayoutChangeEvent, Pressable, View } from 'react-native';
import { Text } from '../../../../components/Typography';
import { GRID } from '../constants';
import { styles } from '../LoginScreen.styles';
import type { AuthMode } from '../types';

type Props = {
  authMode: AuthMode;
  tabAnim: Animated.Value;
  tabPillWidth: number;
  onTabPillLayout: (width: number) => void;
  onSwitchMode: (mode: AuthMode) => void;
};

export function AuthModeTabs({
  authMode,
  tabAnim,
  tabPillWidth,
  onTabPillLayout,
  onSwitchMode,
}: Props) {
  const handleLayout = (event: LayoutChangeEvent) => {
    onTabPillLayout(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.tabRow}>
      <View style={styles.tabPill} onLayout={handleLayout}>
        {tabPillWidth > 0 ? (
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                width: (tabPillWidth - GRID) / 2,
                transform: [
                  {
                    translateX: tabAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, (tabPillWidth - GRID) / 2],
                    }),
                  },
                ],
              },
            ]}
          />
        ) : null}
        {(['register', 'login'] as AuthMode[]).map((mode) => (
          <Pressable key={mode} style={styles.tabBtn} onPress={() => onSwitchMode(mode)}>
            <Text style={[styles.tabTxt, authMode === mode && styles.tabTxtActive]}>
              {mode === 'register' ? 'Register' : 'Login'}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
