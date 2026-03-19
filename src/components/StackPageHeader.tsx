import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BusinessPageHeader, type BusinessHeaderRightAction } from './business-detail/BusinessPageHeader';
import { NAVBAR_BG_COLOR } from '../styles/colors';

type Props = {
  navigation: { canGoBack: () => boolean; goBack: () => void };
  options?: { headerStyle?: unknown; headerTintColor?: string };
  onPressBack?: () => void;
  showBackButton?: boolean;
  rightActions?: BusinessHeaderRightAction[];
};

export function StackPageHeader({ navigation, options, onPressBack, showBackButton, rightActions }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flattenedHeaderStyle = options?.headerStyle
    ? (StyleSheet.flatten(options.headerStyle as never) as { backgroundColor?: string } | undefined)
    : undefined;
  const bgColor = flattenedHeaderStyle?.backgroundColor ?? NAVBAR_BG_COLOR;
  const collapsed = options?.headerTintColor === '#FFFFFF';
  const effectiveShowBackButton = showBackButton ?? navigation.canGoBack();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 14, backgroundColor: bgColor }]}>
      <BusinessPageHeader
        onPressBack={() => {
          if (onPressBack) {
            onPressBack();
            return;
          }
          if (navigation.canGoBack()) navigation.goBack();
        }}
        onPressNotifications={() => router.push('/(stack)/notifications')}
        onPressMessages={() => router.push('/(stack)/dm')}
        rightActions={rightActions}
        menuItems={[]}
        collapsed={true}
        showBackButton={effectiveShowBackButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: NAVBAR_BG_COLOR,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
