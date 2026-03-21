import { StyleSheet } from 'react-native';
import { getCardDepthShadowStyle } from '../../styles/overlayShadow';
import { C } from './theme';

export const chipStyles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export const avatarStyles = StyleSheet.create({
  badgeOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    zIndex: 20,
  },
  verifiedDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.sage,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: C.white,
  },
  topDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: C.topBg,
  },
});

export const reviewerStyles = StyleSheet.create({
  card: {
    width: 240,
    overflow: 'hidden',
    ...getCardDepthShadowStyle(16),
  },
  accent: {
    height: 3,
    width: '100%',
  } as object,
  body: {
    padding: 16,
    gap: 14,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  identityText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  topLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  topLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: 'rgba(251,191,36,0.80)',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  location: {
    fontSize: 12,
    color: C.charcoal45,
    fontWeight: '500',
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 26,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  overflowChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  overflowText: {
    fontSize: 10,
    fontWeight: '600',
  },
  snippet: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    gap: 6,
  },
  snippetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  snippetLatestLabel: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  snippetText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    fontStyle: 'italic',
    letterSpacing: -0.05,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
    marginTop: -8,
  },
  ctaText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export const reviewStyles = StyleSheet.create({
  card: {
    width: 213,
    height: 187,
    backgroundColor: C.cardBg,
    overflow: 'hidden',
    ...getCardDepthShadowStyle(16),
  },
  accent: {
    height: 3,
    width: '100%',
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 28,
    zIndex: 10,
  },
  body: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 6,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingNum: {
    fontSize: 10,
    color: C.charcoal35,
    fontWeight: '700',
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  identityText: {
    flex: 1,
    minWidth: 0,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
    color: C.charcoal,
    letterSpacing: -0.1,
  },
  reviewCount: {
    fontSize: 10,
    color: C.charcoal38,
    fontWeight: '500',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    overflow: 'hidden',
  },
  overflowChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.charcoal06,
    backgroundColor: C.offWhite70,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  overflowText: {
    fontSize: 10,
    fontWeight: '600',
    color: C.charcoal60,
  },
  contentArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  businessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 2,
  },
  businessName: {
    fontSize: 10,
    fontWeight: '600',
    color: C.charcoal45,
    flex: 1,
  },
  reviewText: {
    fontSize: 11,
    color: C.charcoal60,
    lineHeight: 16,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 10,
    color: C.charcoal28,
    fontWeight: '500',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  likesCount: {
    fontSize: 10,
    fontWeight: '600',
    color: C.charcoal38,
  },
});
