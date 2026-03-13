import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BusinessPageHeader } from './business-detail/BusinessPageHeader';
import { businessDetailColors } from './business-detail/styles';
import { FROSTED_CARD_BORDER_COLOR } from '../styles/cardSurface';

type Props = {
  navigation: { canGoBack: () => boolean; goBack: () => void };
  options?: { headerStyle?: unknown; headerTintColor?: string };
  onPressBack?: () => void;
  showBackButton?: boolean;
};

export function StackPageHeader({ navigation, options, onPressBack, showBackButton }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flattenedHeaderStyle = options?.headerStyle
    ? (StyleSheet.flatten(options.headerStyle as never) as { backgroundColor?: string } | undefined)
    : undefined;
  const bgColor = flattenedHeaderStyle?.backgroundColor ?? businessDetailColors.coral;
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
        menuItems={[]}
        collapsed={true}
        showBackButton={effectiveShowBackButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: businessDetailColors.coral,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: FROSTED_CARD_BORDER_COLOR,
    zIndex: 50,
  },
});
