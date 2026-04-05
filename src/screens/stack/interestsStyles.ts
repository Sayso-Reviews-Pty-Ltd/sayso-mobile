import { StyleSheet } from 'react-native';
import { ONBOARDING_TOKENS } from '../../components/onboarding/onboardingTheme';

export const styles = StyleSheet.create({
  contentLayer: {
    position: 'relative',
    zIndex: 1,
  },

  errorBanner: {
    backgroundColor: 'rgba(229,224,229,0.95)',
    borderColor: 'rgba(114,47,55,0.35)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  errorText: {
    color: ONBOARDING_TOKENS.coral,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '600',
  },

  selectionWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  selectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(157,171,155,0.2)',
    backgroundColor: 'rgba(157,171,155,0.10)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selectionPillReady: {
    borderColor: 'rgba(157,171,155,0.3)',
    backgroundColor: 'rgba(157,171,155,0.14)',
  },
  selectionPillText: {
    color: ONBOARDING_TOKENS.sage,
    fontSize: 14,
    fontWeight: '600',
  },
  selectionHint: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: ONBOARDING_TOKENS.charcoal60,
    fontWeight: '600',
    textAlign: 'center',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  circle: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circleFill: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    position: 'relative',
  },
  circleFillSelected: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  circleDisabled: {
    opacity: 0.42,
  },
  circlePressed: {
    transform: [{ scale: 0.95 }],
  },
  circleLabel: {
    color: ONBOARDING_TOKENS.white,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  circleLabelSelected: {
    color: ONBOARDING_TOKENS.white,
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});
