import { SafeAreaView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { homeTokens } from '../../src/screens/tabs/home/HomeTokens';
import { EventsSpecialsFeedScreen } from '../../src/screens/shared/EventsSpecialsFeedScreen';

export default function EventsSpecialsRoute() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Events & Specials' }} />
      <EventsSpecialsFeedScreen subtitle="Upcoming events and live specials worth checking out next." />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: homeTokens.offWhite,
  },
});
