import { StyleSheet } from 'react-native';
import { NAVBAR_BG_COLOR } from '../../styles/colors';
import { APP_PAGE_GUTTER } from '../../styles/layout';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E0E5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: APP_PAGE_GUTTER,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  markRead: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  filterScroll: {
    paddingVertical: 12,
  },
  listHeader: {
    gap: 8,
  },
  filterRow: {
    gap: 8,
    paddingHorizontal: APP_PAGE_GUTTER,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.80)',
    borderWidth: 1,
    borderColor: 'rgba(45,45,45,0.20)',
  },
  chipActive: {
    backgroundColor: NAVBAR_BG_COLOR,
    borderColor: NAVBAR_BG_COLOR,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D2D2D',
  },
  chipTextActive: {
    color: '#fff',
  },
  emptyFilter: {
    paddingHorizontal: APP_PAGE_GUTTER,
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyFilterText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
