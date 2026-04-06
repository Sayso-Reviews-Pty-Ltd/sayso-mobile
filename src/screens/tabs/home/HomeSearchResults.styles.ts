import { StyleSheet } from 'react-native';
import { homeTokens } from './HomeTokens';
import { APP_PAGE_GUTTER } from '../../../styles/layout';
import { CARD_SHADOW_MD } from '../../../styles/overlayShadow';

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: homeTokens.offWhite,
  },
  content: {
    paddingHorizontal: APP_PAGE_GUTTER,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: homeTokens.offWhite,
  },
  header: {
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleColumn: {
    flex: 1,
    gap: 2,
  },
  modeLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: 'rgba(45,45,45,0.60)',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: homeTokens.charcoal,
    letterSpacing: -0.3,
  },
  clearButton: {
    paddingBottom: 2,
    flexShrink: 0,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(45,45,45,0.80)',
    textDecorationLine: 'underline',
  },
  filters: {
    gap: 12,
    marginTop: 16,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: 'rgba(45,45,45,0.60)',
  },
  filterPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: homeTokens.borderSoft,
    backgroundColor: 'rgba(255,255,255,0.60)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(157,171,155,0.92)',
    borderColor: 'rgba(157,171,155,0.50)',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(45,45,45,0.70)',
  },
  filterChipTextActive: {
    color: homeTokens.white,
  },
  notice: {
    fontSize: 13,
    lineHeight: 18,
    color: homeTokens.coral,
    marginTop: 12,
  },
  errorBox: {
    marginTop: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(114,47,55,0.30)',
    backgroundColor: 'rgba(114,47,55,0.10)',
    paddingHorizontal: 16,
    paddingVertical: 20,
    ...CARD_SHADOW_MD,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    color: homeTokens.coral,
  },
  separator: {
    height: 12,
  },
});
