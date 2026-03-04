import { Stack } from 'expo-router';
import { sharedStackScreenOptions } from '../../src/navigation/screenOptions';

export default function SharedStackLayout() {
  return <Stack screenOptions={sharedStackScreenOptions} />;
}
