import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../../src/hooks/useNotifications';

export default function TabsLayout() {
  const { unreadCount } = useNotifications();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#111827',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: { borderTopColor: '#F3F4F6' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'notifications' : 'notifications-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
