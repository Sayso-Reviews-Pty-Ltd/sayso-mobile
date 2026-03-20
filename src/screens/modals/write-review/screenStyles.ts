import { StyleSheet } from 'react-native';
import { C } from './constants';

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.coral },
  safeAreaInner: { flex: 1, backgroundColor: C.offWhite },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 16 },
});
