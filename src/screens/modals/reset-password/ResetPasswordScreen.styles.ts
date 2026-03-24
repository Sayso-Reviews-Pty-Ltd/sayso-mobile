import { StyleSheet } from 'react-native';
import { C, FIELD_ICON_SIZE, GRID, MAX_RAIL_WIDTH } from './constants';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },

  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  skeletonGroup: {
    alignItems: 'center',
    gap: 10,
  },
  skeletonOrb: {
    width: 54,
    height: 54,
    borderRadius: 999,
  },
  skeletonLine: {
    width: 140,
    height: 10,
    borderRadius: 999,
  },
  loadingLabel: {
    fontSize: 15,
    color: 'rgba(45,45,45,0.6)',
  },

  scroll: {
    paddingHorizontal: GRID * 2,
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
    borderRadius: 12,
    paddingHorizontal: GRID,
    paddingVertical: GRID * 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },

  stateIconWrap: {
    alignItems: 'center',
    marginBottom: GRID * 2,
  },
  stateCircle: {
    width: 80,
    height: 80,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateCircleWarning: {
    backgroundColor: 'rgba(245,158,11,0.15)',
  },
  stateCircleSuccess: {
    backgroundColor: 'rgba(125,155,118,0.22)',
  },
  stateMessage: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    marginBottom: GRID * 2.5,
    fontWeight: '400',
    paddingHorizontal: GRID,
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
    color: C.errorText,
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
    top: '50%',
    marginTop: -(FIELD_ICON_SIZE / 2),
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
  passwordInput: {
    paddingRight: GRID * 6,
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
  eyeBtn: {
    position: 'absolute',
    right: GRID * 1.75,
    top: 0,
    bottom: 0,
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
  },
  submitTxt: {
    fontSize: 16,
    fontWeight: '600',
    color: C.white,
  },

  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: GRID * 1.5,
    marginTop: GRID,
  },
  secondaryBtnTxt: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
});
