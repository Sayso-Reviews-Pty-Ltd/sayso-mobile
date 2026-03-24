import { StyleSheet } from 'react-native';
import { ONBOARDING_TOKENS } from './onboardingTheme';
import { APP_PAGE_GUTTER } from '../../styles/layout';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ONBOARDING_TOKENS.offWhite,
  },
  flex: { flex: 1 },

  topProgressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 4,
    backgroundColor: 'rgba(45,45,45,0.10)',
    zIndex: 20,
  },
  topProgressFill: {
    height: '100%',
    backgroundColor: ONBOARDING_TOKENS.cardBg,
    transformOrigin: 'left center',
  },

  backWrap: {
    position: 'absolute',
    left: APP_PAGE_GUTTER,
    zIndex: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: 'rgba(114,47,55,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(114,47,55,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: {
    paddingHorizontal: APP_PAGE_GUTTER,
    flexGrow: 1,
  },
  mainContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    color: ONBOARDING_TOKENS.charcoal,
    letterSpacing: -0.3,
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  subtitle: {
    fontWeight: '400',
    color: ONBOARDING_TOKENS.charcoal70,
    textAlign: 'center',
    paddingHorizontal: 8,
    maxWidth: 520,
  },

  actionWrap: {
    marginTop: 'auto',
    paddingTop: 24,
    paddingBottom: 2,
    alignItems: 'center',
  },
  continueBtn: {
    width: '100%',
    maxWidth: 460,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  continueBtnGradient: {
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnDisabled: {
    opacity: 0.42,
  },
  continueBtnPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  continueTxt: {
    fontSize: 16,
    fontWeight: '600',
    color: ONBOARDING_TOKENS.white,
  },
  loadingSpinner: { marginRight: 8 },

  progressDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: ONBOARDING_TOKENS.charcoal20,
  },
  progressDotActive: {
    backgroundColor: ONBOARDING_TOKENS.cardBg,
  },
  progressDotComplete: {
    backgroundColor: 'rgba(157,171,155,0.6)',
  },
  progressLabel: {
    marginTop: 6,
    fontSize: 14,
    color: ONBOARDING_TOKENS.charcoal70,
    fontWeight: '600',
  },
});
