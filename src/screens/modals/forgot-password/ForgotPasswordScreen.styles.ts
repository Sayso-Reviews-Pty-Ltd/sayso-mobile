import { StyleSheet } from 'react-native';
import { C, GRID, MAX_RAIL_WIDTH } from './constants';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.page },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: GRID * 2,
    alignItems: 'center',
  },
  rail: {
    width: '100%',
    maxWidth: MAX_RAIL_WIDTH,
    gap: GRID * 3,
  },
  cardWrap: {
    width: '100%',
  },
  card: {
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: GRID,
    paddingVertical: GRID * 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
});
