import { StyleSheet } from 'react-native';
import { homeTokens } from '../home/HomeTokens';
import { FROSTED_CARD_BORDER_COLOR } from '../../../styles/cardSurface';
import { CARD_SHADOW_MD } from '../../../styles/overlayShadow';
import { CARD_RADIUS, CARD_CTA_RADIUS } from '../../../styles/radii';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: homeTokens.coral,
  },
  flexOne: {
    flex: 1,
  },
  headerWrap: {
    backgroundColor: homeTokens.coral,
    position: 'relative',
    zIndex: 20,
    borderBottomWidth: 1,
    borderBottomColor: FROSTED_CARD_BORDER_COLOR,
  },
  headerWrapExpanded: {
    paddingTop: 10,
    paddingBottom: 14,
  },
  headerWrapCollapsed: {
    paddingTop: 6,
    paddingBottom: 10,
  },
  headerMaterial: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  headerMaterialCollapsed: {
    shadowColor: homeTokens.coralDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: homeTokens.pageGutter,
    paddingVertical: 8,
    position: 'relative',
    zIndex: 1,
  },
  headerRowWrap: {
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerRowWrapExpanded: {
    height: 42,
    opacity: 1,
  },
  headerRowWrapCollapsed: {
    height: 0,
    opacity: 0,
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: 'MonarchParadox',
    color: homeTokens.white,
    letterSpacing: 3,
  },
  searchBarWrap: {
    marginHorizontal: homeTokens.pageGutter,
    height: 60,
    padding: 4,
    overflow: 'visible',
    position: 'relative',
    zIndex: 30,
  },
  searchBarWrapExpanded: {
    marginTop: 10,
  },
  searchBarWrapCollapsed: {
    marginTop: 3,
  },
  suggestionsOverlay: {
    position: 'absolute',
    left: homeTokens.pageGutter,
    right: homeTokens.pageGutter,
    zIndex: 100,
  },
  content: {
    backgroundColor: homeTokens.offWhite,
    paddingBottom: 24,
  },
  section: {
    paddingTop: 24,
    backgroundColor: homeTokens.offWhite,
  },
  scroll: {
    backgroundColor: homeTokens.offWhite,
  },
  guestCardWrap: {
    marginHorizontal: homeTokens.pageGutter,
  },
  guestCardSurface: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  guestCard: {
    borderRadius: CARD_RADIUS,
    padding: 20,
  },
  guestBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.92)',
    marginBottom: 14,
  },
  guestBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: homeTokens.coral,
  },
  guestTitle: {
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '700',
    color: homeTokens.white,
    maxWidth: 320,
  },
  guestActions: {
    gap: 12,
    marginTop: 18,
  },
  primaryGuestButton: {
    borderRadius: CARD_CTA_RADIUS,
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: homeTokens.white,
  },
  primaryGuestButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: homeTokens.coral,
    textAlign: 'center',
  },
  secondaryGuestButton: {
    borderRadius: CARD_CTA_RADIUS,
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  secondaryGuestButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: homeTokens.white,
    textAlign: 'center',
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
    marginTop: 6,
  },
  messageActionButton: {
    marginTop: 14,
    alignSelf: 'flex-start',
    borderRadius: CARD_CTA_RADIUS,
    backgroundColor: homeTokens.coral,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageActionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: homeTokens.white,
  },
  forYouTierChip: {
    alignSelf: 'flex-start',
    marginHorizontal: homeTokens.pageGutter,
    marginBottom: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(114,47,55,0.24)',
    backgroundColor: 'rgba(114,47,55,0.10)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  forYouTierChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: homeTokens.coral,
  },
});
