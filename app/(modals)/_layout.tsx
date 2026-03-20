import { Stack } from 'expo-router';
import {
  fullScreenModalScreenOptions,
  sheetModalScreenOptions,
} from '../../src/navigation/screenOptions';

export default function ModalLayout() {
  return (
    <Stack screenOptions={fullScreenModalScreenOptions}>
      <Stack.Screen name="filters" options={sheetModalScreenOptions} />
      <Stack.Screen
        name="write-review/[type]/[id]"
        options={{
          ...sheetModalScreenOptions,
          headerShown: true,
        }}
      />
      <Stack.Screen name="change-password" options={fullScreenModalScreenOptions} />
    </Stack>
  );
}
