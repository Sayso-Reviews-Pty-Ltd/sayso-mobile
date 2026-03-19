import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sharedStackScreenOptions } from '../../src/navigation/screenOptions';
import { StackPageHeader } from '../../src/components/StackPageHeader';
import { NAVBAR_BG_COLOR } from '../../src/styles/colors';

export default function SharedStackLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <Stack
        screenOptions={{
          ...sharedStackScreenOptions,
          header: (props) => <StackPageHeader {...props} />,
        }}
      />
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
