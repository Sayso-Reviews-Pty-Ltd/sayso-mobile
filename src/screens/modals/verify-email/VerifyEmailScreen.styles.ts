import { StyleSheet } from 'react-native';
import { C } from './constants';
import { APP_PAGE_GUTTER } from '../../../styles/layout';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 8 },

  backWrap: { position: 'absolute', left: APP_PAGE_GUTTER, zIndex: 20 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.56)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  textBlock: {
    marginBottom: 14,
    alignItems: 'center',
  },
  heading: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    color: C.charcoal,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  subheading: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 24,
    color: C.charcoal70,
    textAlign: 'center',
  },

  card: {
    width: '100%',
    backgroundColor: C.cardBg,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  mailCircle: {
    width: 84,
    height: 84,
    borderRadius: 999,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: 12,
  },
  emailBtn: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.wine,
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  emailBtnTxt: {
    fontSize: 16,
    fontWeight: '600',
    color: C.white,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 13,
    lineHeight: 20,
    color: C.charcoal60,
    textAlign: 'center',
    marginBottom: 14,
  },

  whyCard: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(125,155,118,0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 14,
  },
  whyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  whyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.charcoal,
  },
  whyItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 5,
  },
  whyDot: {
    width: 4,
    height: 4,
    borderRadius: 999,
    marginTop: 7,
    backgroundColor: 'rgba(45,45,45,0.65)',
  },
  whyItemTxt: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(45,45,45,0.8)',
  },

  resendBtn: {
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 10,
  },
  resendBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  resendBtnTxt: {
    fontSize: 14,
    fontWeight: '700',
    color: C.white,
  },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: C.errorBg,
    borderWidth: 1,
    borderColor: C.errorBorder,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  errorTxt: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: C.errorText,
    lineHeight: 18,
  },

  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(125,155,118,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(125,155,118,0.30)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  successTxt: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: C.sage,
  },

  spamHint: {
    fontSize: 12,
    lineHeight: 17,
    color: C.charcoal60,
    textAlign: 'center',
    marginBottom: 8,
  },
  verifiedLink: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  verifiedLinkTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: C.charcoal60,
    textDecorationLine: 'underline',
  },

  backToLogin: {
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 6,
    shadowOpacity: 0,
    elevation: 0,
  },
  backToLoginTxt: {
    fontSize: 14,
    fontWeight: '600',
    color: C.charcoal45,
  },

  btnPressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  btnDisabled: { opacity: 0.52 },
});
