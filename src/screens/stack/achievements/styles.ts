import { StyleSheet } from 'react-native';
import { C, GRID } from './constants';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: GRID * 2,
    gap: GRID * 2,
  },
  backBtnWrap: {
    position: 'absolute',
    left: GRID * 2,
    zIndex: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  pageHeader: {
    alignItems: 'center',
    gap: GRID * 0.5,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: C.white,
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: C.white50,
  },

  ringSection: {
    alignItems: 'center',
    gap: GRID * 2.5,
  },

  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringTrack: {
    position: 'absolute',
    borderColor: C.white10,
  },
  ringClipLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    overflow: 'hidden',
  },
  ringHalf: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderColor: C.gold,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  ringCenter: {
    position: 'absolute',
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPct: {
    fontSize: 32,
    fontWeight: '800',
    color: C.white,
    lineHeight: 40,
  },
  ringLabel: {
    fontSize: 12,
    color: C.white50,
  },

  quickStats: {
    flexDirection: 'row',
    gap: GRID * 2,
  },
  quickStat: {
    alignItems: 'center',
    gap: 4,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: C.white,
    lineHeight: 24,
  },
  quickStatLabel: {
    fontSize: 11,
    color: C.white50,
  },

  groups: {
    gap: GRID * 1.5,
  },

  groupSection: {
    backgroundColor: C.cardDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.cardDarkBorder,
    overflow: 'hidden',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: GRID * 2,
    gap: GRID * 1.5,
  },
  groupIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  groupHeaderText: {
    flex: 1,
    gap: 4,
  },
  groupTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.white,
  },
  groupProgress: {
    fontSize: 12,
    color: C.white50,
  },

  groupBadges: {
    borderTopWidth: 1,
    borderTopColor: C.cardDarkBorder,
  },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: GRID * 2,
    gap: GRID * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: C.cardDarkBorder,
  },
  badgeRowLocked: {
    opacity: 0.5,
  },
  badgeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badgeIconCircleEarned: {
    backgroundColor: 'rgba(255,215,0,0.15)',
  },
  badgeIconCircleLocked: {
    backgroundColor: C.white10,
  },
  badgeRowImg: {
    width: 24,
    height: 24,
  },
  badgeRowInfo: {
    flex: 1,
    gap: 4,
  },
  badgeRowName: {
    fontSize: 14,
    fontWeight: '600',
    color: C.white,
  },
  badgeRowNameLocked: {
    color: C.white70,
  },
  badgeRowDesc: {
    fontSize: 12,
    color: C.white50,
    lineHeight: 16,
  },
  badgeRowDate: {
    fontSize: 11,
    color: C.gold,
  },
  badgeCheckmark: {
    flexShrink: 0,
  },

  unauthState: {
    alignItems: 'center',
    gap: GRID * 2,
    paddingVertical: GRID * 4,
  },
  unauthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: C.white70,
    textAlign: 'center',
  },
  signInBtn: {
    paddingHorizontal: GRID * 3,
    paddingVertical: GRID * 1.5,
    borderRadius: 999,
    backgroundColor: C.wine,
  },
  signInBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.white,
  },

  ringPlaceholder: {
    alignItems: 'center',
    paddingVertical: GRID * 2,
  },
  skeletonRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  skeletonGroup: {
    height: 64,
    borderRadius: 12,
  },
});
