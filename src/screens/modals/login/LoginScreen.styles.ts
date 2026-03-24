import { StyleSheet } from 'react-native';
import { C, GRID, MAX_RAIL_WIDTH } from './constants';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },

  scroll: {
    paddingHorizontal: GRID,
    alignItems: 'center',
  },

  rail: {
    width: '100%',
    maxWidth: MAX_RAIL_WIDTH,
    gap: GRID * 3,
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
    backgroundColor: 'rgba(255,255,255,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(45,45,45,0.08)',
  },

  titleBlock: {
    alignItems: 'center',
    gap: GRID,
    paddingHorizontal: GRID,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    color: C.charcoal,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: C.charcoal70,
    textAlign: 'center',
    fontWeight: '400',
  },

  cardWrap: {
    width: '100%',
  },
  card: {
    width: '100%',
    backgroundColor: C.card,
    borderRadius: 12,
    paddingHorizontal: GRID,
    paddingVertical: GRID * 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },

  tabRow: {
    alignItems: 'center',
    marginBottom: GRID * 3,
  },
  tabPill: {
    width: '100%',
    flexDirection: 'row',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
    padding: GRID * 0.5,
    overflow: 'hidden',
  },
  tabIndicator: {
    position: 'absolute',
    top: GRID * 0.5,
    bottom: GRID * 0.5,
    left: GRID * 0.5,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: GRID * 1.25,
    zIndex: 1,
  },
  tabTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: C.white70,
  },
  tabTxtActive: {
    color: C.charcoal,
  },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GRID,
    backgroundColor: C.errorBg,
    borderWidth: 1,
    borderColor: C.errorBorder,
    borderRadius: GRID * 1.5,
    padding: GRID * 1.5,
    marginBottom: GRID * 2,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: C.error,
    lineHeight: 18,
  },

  fieldWrap: {
    marginBottom: GRID * 2,
  },
  fieldLabel: {
    marginBottom: GRID,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.93)',
  },
  inputRow: {
    position: 'relative',
    minHeight: GRID * 7,
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: C.inputBg,
    borderWidth: 1,
    borderColor: C.inputBorder,
    overflow: 'hidden',
  },
  inputRowError: {
    borderColor: C.wine,
  },
  inputRowFocused: {
    borderColor: C.wine,
    shadowColor: C.wine,
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  inputLeftIcon: {
    position: 'absolute',
    left: GRID * 2,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  input: {
    paddingLeft: GRID * 5.75,
    paddingRight: GRID * 2.5,
    paddingVertical: GRID * 1.75,
    fontSize: 16,
    color: C.charcoal,
    fontFamily: 'Urbanist_400Regular',
    borderRadius: 999,
  },
  inputFilled: {
    fontFamily: 'Urbanist_600SemiBold',
  },
  fieldError: {
    marginTop: GRID * 0.5,
    fontSize: 12,
    fontWeight: '600',
    color: '#FDE2D5',
  },

  passwordInput: {
    paddingRight: GRID * 6,
  },
  eyeBtn: {
    position: 'absolute',
    right: GRID * 1.75,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  strengthWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GRID,
    marginTop: GRID,
  },
  strengthBars: {
    flex: 1,
    flexDirection: 'row',
    gap: GRID * 0.5,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 999,
  },
  strengthLabel: {
    width: 78,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '600',
  },

  forgotWrap: {
    alignItems: 'flex-end',
    marginBottom: GRID * 2,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: GRID * 1.25,
    marginBottom: GRID * 2,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: C.sage,
    borderColor: C.sage,
  },
  consentText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.86)',
    fontWeight: '400',
  },
  consentLink: {
    fontWeight: '600',
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },

  submitBtn: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  submitBtnGradient: {
    minHeight: GRID * 7,
    paddingVertical: GRID * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  submitBtnDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  submitTxt: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GRID,
    marginVertical: GRID * 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },

  googleBtn: {
    minHeight: GRID * 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: GRID * 1.25,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 0,
  },
  googleBtnPressed: {
    opacity: 0.92,
  },
  googleTxt: {
    fontSize: 14,
    fontWeight: '600',
    color: C.charcoal,
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: GRID * 2.5,
    paddingTop: GRID * 2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  switchText: {
    fontSize: 14,
    color: C.white,
    fontWeight: '400',
  },
  switchLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
