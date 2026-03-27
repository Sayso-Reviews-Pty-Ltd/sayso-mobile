import { StyleSheet } from 'react-native';
import { ONBOARDING_TOKENS } from '../../components/onboarding/onboardingTheme';

export const completeStyles = StyleSheet.create({
  confettiLayer: {
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    gap: 18,
    marginBottom: 8,
  },
  iconRow: {
    marginTop: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  iconBubble: {
    width: 46,
    height: 46,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(157,171,155,0.32)',
    backgroundColor: 'rgba(157,171,155,0.16)',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(157,171,155,0.15)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(157,171,155,0.35)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: ONBOARDING_TOKENS.sage,
  },
  autoRedirectHint: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(45,45,45,0.60)',
    textAlign: 'center',
  },
});
