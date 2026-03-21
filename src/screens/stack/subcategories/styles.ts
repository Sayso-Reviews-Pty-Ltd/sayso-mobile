import { StyleSheet } from 'react-native';
import { ONBOARDING_TOKENS } from '../../../components/onboarding/onboardingTheme';

export const styles = StyleSheet.create({
  errorBanner: {
    backgroundColor: 'rgba(229,224,229,0.95)',
    borderColor: 'rgba(114,47,55,0.35)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  errorText: {
    color: ONBOARDING_TOKENS.coral,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  counterWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  counterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(157,171,155,0.2)',
    backgroundColor: 'rgba(157,171,155,0.10)',
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  counterPillReady: {
    borderColor: 'rgba(157,171,155,0.3)',
    backgroundColor: 'rgba(157,171,155,0.14)',
  },
  counterText: {
    color: ONBOARDING_TOKENS.sage,
    fontSize: 14,
    fontWeight: '600',
  },
  counterHint: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 18,
    color: ONBOARDING_TOKENS.charcoal60,
    fontWeight: '600',
    textAlign: 'center',
  },
  group: {
    marginBottom: 20,
  },
  groupLabel: {
    fontSize: 17,
    lineHeight: 22,
    color: ONBOARDING_TOKENS.charcoal,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 12,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  pill: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(157,171,155,0.3)',
    overflow: 'hidden',
  },
  pillFill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  pillSelected: {
    borderColor: ONBOARDING_TOKENS.coral,
  },
  pillDisabled: {
    opacity: 0.42,
  },
  pillPressed: {
    transform: [{ scale: 0.97 }],
  },
  pillText: {
    color: ONBOARDING_TOKENS.sage,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  pillTextSelected: {
    color: ONBOARDING_TOKENS.white,
  },
  emptyState: {
    paddingVertical: 18,
  },
  emptyStateText: {
    textAlign: 'center',
    color: ONBOARDING_TOKENS.charcoal60,
    fontSize: 14,
    fontWeight: '400',
  },
});
