import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  fullScreenModalScreenOptions,
  sheetModalScreenOptions,
} from '../../src/navigation/screenOptions';
import { NAVBAR_BG_COLOR } from '../../src/styles/colors';

export default function ModalLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
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
        <Stack.Screen name="change-email" options={fullScreenModalScreenOptions} />
      </Stack>
      <View pointerEvents="none" style={[styles.bottomChrome, { height: insets.bottom }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
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
