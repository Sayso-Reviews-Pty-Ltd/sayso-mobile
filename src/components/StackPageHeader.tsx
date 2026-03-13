import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BusinessPageHeader, type BusinessHeaderMenuItem } from './business-detail/BusinessPageHeader';
import { businessDetailColors } from './business-detail/styles';
import { FROSTED_CARD_BORDER_COLOR } from '../styles/cardSurface';
import { routes } from '../navigation/routes';

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

  const menuItems = useMemo<BusinessHeaderMenuItem[]>(
    () => [
      { key: 'home', label: 'Home', onPress: () => router.push(routes.home() as never) },
      { key: 'for-you', label: 'For You', onPress: () => router.push(routes.forYou() as never) },
      { key: 'trending', label: 'Trending', onPress: () => router.push(routes.trending() as never) },
      { key: 'events', label: 'Events & Specials', onPress: () => router.push(routes.eventsSpecials() as never) },
      { key: 'saved', label: 'Saved', onPress: () => router.push(routes.saved() as never) },
      { key: 'profile', label: 'Profile', onPress: () => router.push(routes.profile() as never) },
    ],
    [router]
  );

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
        menuItems={menuItems}
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
