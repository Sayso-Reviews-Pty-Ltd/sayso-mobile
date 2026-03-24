import { Platform, StyleSheet } from 'react-native';
import { homeTokens } from '../HomeTokens';
import { CARD_SHADOW_MD, getCardDepthShadowStyle } from '../../../../styles/overlayShadow';
import { CARD_RADIUS } from '../../../../styles/radii';
import { NAVBAR_BG_COLOR } from '../../../../styles/colors';

export const REVIEWER_CARD_WIDTH = 240;
export const REVIEWER_GAP = 16;
export const REVIEWER_SKELETONS = [0, 1, 2] as const;
export const FLATLIST_PERF = {
  initialNumToRender: 2,
  maxToRenderPerBatch: 2,
  windowSize: 5,
  removeClippedSubviews: Platform.OS === 'android',
} as const;

export const REVIEWER_SNAP_INTERVAL = REVIEWER_CARD_WIDTH + REVIEWER_GAP;
export const SCALE_INACTIVE = 0.92;
export const OPACITY_INACTIVE = 0.7;

export const styles = StyleSheet.create({
  section: {
    paddingTop: 16,
    paddingBottom: Platform.OS === 'web' ? 96 : 48,
    backgroundColor: homeTokens.offWhite,
  },
  subsection: {
    marginTop: 4,
    marginBottom: 16,
    backgroundColor: homeTokens.offWhite,
  },
  subsectionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: homeTokens.pageGutter,
    marginBottom: 16,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: homeTokens.sageWash,
    borderWidth: 1,
    borderColor: 'rgba(125, 155, 118, 0.28)',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: homeTokens.sageDark,
  },
  subsectionAction: {
    fontSize: 14,
    fontWeight: '600',
    color: homeTokens.coral,
  },
  subsectionActionButton: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  subsectionActionButtonWithIcon: {
    flexDirection: 'row',
    gap: 4,
  },
  subsectionActionIcon: {
    marginTop: 0,
  },
  row: {
    overflow: 'visible',
    backgroundColor: homeTokens.offWhite,
  },
  rowContent: {
    paddingHorizontal: homeTokens.pageGutter,
    paddingTop: 4,
    paddingBottom: 16,
    backgroundColor: homeTokens.offWhite,
  },
  reviewerCardSkeleton: {
    minHeight: 260,
    padding: 16,
    gap: 8,
    backgroundColor: homeTokens.cardBg,
  },
  reviewerSkeletonCardShell: {
    width: 240,
    overflow: 'hidden',
    backgroundColor: homeTokens.cardBg,
    ...getCardDepthShadowStyle(16),
  },
  reviewerSkeletonTopAccent: {
    height: 3,
    backgroundColor: 'rgba(125,155,118,0.42)',
  },
  reviewerSkeletonAvatar: {
    width: 56,
    height: 56,
    borderRadius: 999,
  },
  reviewerSkeletonTitle: {
    width: '72%',
    height: 14,
    borderRadius: 7,
  },
  reviewerSkeletonSub: {
    width: '48%',
    height: 11,
    borderRadius: 6,
  },
  reviewerSkeletonLine: {
    width: '100%',
    height: 10,
    borderRadius: 6,
  },
  reviewerSkeletonLineShort: {
    width: '78%',
    height: 10,
    borderRadius: 6,
  },
  reviewerSkeletonPillRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  reviewerSkeletonPill: {
    width: 80,
    height: 24,
    borderRadius: 999,
  },
  messageCard: {
    marginHorizontal: homeTokens.pageGutter,
    padding: 20,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: homeTokens.borderSoft,
    backgroundColor: homeTokens.cardBg,
    ...CARD_SHADOW_MD,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: homeTokens.charcoal,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: homeTokens.textSecondary,
    marginTop: 8,
  },
  emptyContributorsCard: {
    marginHorizontal: homeTokens.pageGutter,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(92, 37, 43, 0.46)',
    backgroundColor: NAVBAR_BG_COLOR,
    alignItems: 'center',
    ...CARD_SHADOW_MD,
  },
  emptyContributorsTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: homeTokens.white,
    textAlign: 'center',
  },
  emptyContributorsBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.84)',
    textAlign: 'center',
    maxWidth: 320,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 16,
  },
  logoWordmark: {
    fontSize: 26,
    lineHeight: 34,
    fontFamily: 'MonarchParadox',
    letterSpacing: 0.2,
    textTransform: 'none',
    color: homeTokens.white,
  },
  badgesScript: {
    fontSize: 16,
    lineHeight: 16,
    fontStyle: 'italic',
    fontWeight: '400',
    color: homeTokens.white,
  },
  exploreBadgesButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  exploreBadgesText: {
    fontSize: 13,
    fontWeight: '700',
    color: homeTokens.white,
  },
  badgeMarqueeContainer: {
    marginTop: 20,
    marginHorizontal: -20,
    alignSelf: 'stretch',
    backgroundColor: NAVBAR_BG_COLOR,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.10)',
    paddingVertical: 12,
  },
  badgeMarqueeViewport: {
    width: '100%',
    overflow: 'hidden',
  },
  badgeTrack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeTrackGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.36)',
    backgroundColor: 'rgba(255,255,255,0.92)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  badgeChipIcon: {
    width: 18,
    height: 18,
  },
  badgeChipLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(45,45,45,0.80)',
  },
});
