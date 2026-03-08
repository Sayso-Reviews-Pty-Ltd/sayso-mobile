import { useCallback } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useNavigation } from 'expo-router';
import { homeTokens } from '../../src/screens/tabs/home/HomeTokens';
import { EventsSpecialsFeedScreen } from '../../src/screens/shared/EventsSpecialsFeedScreen';

const NAVBAR_BG = '#722F37';
const SCROLL_COLOR_THRESHOLD = 60;

export default function EventsSpecialsRoute() {
  const navigation = useNavigation();

  const handleScrollY = useCallback((y: number) => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: y > SCROLL_COLOR_THRESHOLD ? NAVBAR_BG : homeTokens.offWhite,
      },
      headerTintColor: y > SCROLL_COLOR_THRESHOLD ? '#FFFFFF' : homeTokens.charcoal,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Events & Specials' }} />
      <EventsSpecialsFeedScreen
        subtitle="Upcoming events and live specials worth checking out next."
        onScrollY={handleScrollY}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: homeTokens.offWhite,
  },
});
