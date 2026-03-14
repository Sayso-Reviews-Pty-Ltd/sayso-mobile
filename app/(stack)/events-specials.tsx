import { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { useNavigation } from 'expo-router';
import { EventsSpecialsFeedScreen } from '../../src/screens/shared/EventsSpecialsFeedScreen';

const NAVBAR_BG = '#722F37';
const SCROLL_COLOR_THRESHOLD = 60;

export default function EventsSpecialsRoute() {
  const navigation = useNavigation();
  const headerCollapsedRef = useRef(false);

  const handleScrollY = useCallback((y: number) => {
    const collapsed = y > SCROLL_COLOR_THRESHOLD;
    if (collapsed === headerCollapsedRef.current) return;
    headerCollapsedRef.current = collapsed;
    navigation.setOptions({
      headerStyle: {
        backgroundColor: NAVBAR_BG,
      },
      headerTintColor: '#FFFFFF',
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Events & Specials' }} />
      <EventsSpecialsFeedScreen
        subtitle="Upcoming events and live specials worth checking out next."
        onScrollY={handleScrollY}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E0E5',
  },
});
