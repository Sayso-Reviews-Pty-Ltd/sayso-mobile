import { StyleSheet } from 'react-native';
import { C } from './constants';
import { APP_PAGE_GUTTER } from '../../../styles/layout';

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.coral },
  safeAreaInner: { flex: 1, backgroundColor: C.offWhite },
  content: { paddingHorizontal: APP_PAGE_GUTTER, paddingTop: 8, paddingBottom: 24, gap: 16 },
});
