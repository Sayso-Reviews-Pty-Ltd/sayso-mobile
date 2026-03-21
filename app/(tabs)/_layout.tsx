import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotifications } from '../../src/hooks/useNotifications';
import { StackPageHeader } from '../../src/components/StackPageHeader';
import { NAVBAR_BG_COLOR } from '../../src/styles/colors';
import { haptics } from '../../src/lib/haptics';

export default function TabsLayout() {
  const { unreadCount } = useNotifications();
  const isWeb = Platform.OS === 'web';
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <Tabs
        screenListeners={{
          tabPress: () => haptics.selection(),
        }}
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: NAVBAR_BG_COLOR },
          headerTintColor: '#FFFFFF',
          headerShadowVisible: false,
          sceneStyle: { backgroundColor: '#E5E0E5' },
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: 'rgba(255,255,255,0.55)',
          tabBarLabelStyle: { fontFamily: 'Urbanist_600SemiBold', fontSize: 11, letterSpacing: 0.2 },
          tabBarStyle: isWeb ? styles.webTabBar : styles.nativeTabBar,
          tabBarBackground: isWeb ? undefined : () => <View style={styles.nativeTabBarBackground} />,
        }}
      >
        <Tabs.Screen
          name="home/index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="leaderboard/index"
          options={{
            title: 'Leaderboard',
            href: '/leaderboard',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'trophy' : 'trophy-outline'} color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="saved/index"
          options={{
            title: 'Saved',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile/index"
          options={{
            title: 'Profile',
            headerShown: true,
            header: (props) => <StackPageHeader {...props} showBackButton={props.navigation.canGoBack()} />,
            tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} color={color} size={size} />
            ),
          }}
        />
      </Tabs>
      <View pointerEvents="none" style={[styles.bottomChrome, { height: insets.bottom }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: NAVBAR_BG_COLOR,
  },
  webTabBar: {
    borderTopColor: '#5C252B',
    backgroundColor: NAVBAR_BG_COLOR,
  },
  nativeTabBar: {
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    position: 'absolute',
    elevation: 0,
  },
  nativeTabBarBackground: {
    flex: 1,
    backgroundColor: NAVBAR_BG_COLOR,
  },
  bottomChrome: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: NAVBAR_BG_COLOR,
  },
});
