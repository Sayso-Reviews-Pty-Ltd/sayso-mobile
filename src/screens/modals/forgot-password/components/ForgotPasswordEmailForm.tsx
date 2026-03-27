import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, TextInput } from '../../../../components/Typography';
import { C, FIELD_ICON_SIZE, GRID } from '../constants';
import { GradientActionButton } from './GradientActionButton';

type Props = {
  error: string;
  email: string;
  emailError: string;
  emailIsValid: boolean;
  focusedField: boolean;
  isFormValid: boolean;
  isSubmitting: boolean;
  primaryScale: Animated.Value;
  onChangeEmail: (value: string) => void;
  onFocusEmail: () => void;
  onBlurEmail: () => void;
  onSubmit: () => void;
  onSignIn: () => void;
};

export function ForgotPasswordEmailForm({
  error,
  email,
  emailError,
  emailIsValid,
  focusedField,
  isFormValid,
  isSubmitting,
  primaryScale,
  onChangeEmail,
  onFocusEmail,
  onBlurEmail,
  onSubmit,
  onSignIn,
}: Props) {
  return (
    <>
      {!!error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color={C.errorText} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>Email</Text>
        <View
          style={[
            styles.inputRow,
            focusedField ? styles.inputRowFocused : null,
            emailError ? styles.inputRowError : null,
          ]}
        >
          <Ionicons
            name={emailError ? 'alert-circle' : emailIsValid ? 'checkmark-circle' : 'mail'}
            size={FIELD_ICON_SIZE}
            color={
              emailError
                ? C.wine
                : emailIsValid
                  ? C.sage
                  : focusedField
                    ? C.sage
                    : C.charcoal60
            }
            style={styles.inputLeftIcon}
          />
          <TextInput
            style={[styles.input, email ? styles.inputFilled : null]}
            value={email}
            onChangeText={onChangeEmail}
            onFocus={onFocusEmail}
            onBlur={onBlurEmail}
            placeholder="you@example.com"
            placeholderTextColor={C.charcoal50}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />
        </View>
        {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
      </View>

      <Animated.View style={{ transform: [{ scale: primaryScale }] }}>
        <GradientActionButton
          label={isSubmitting ? 'Sending…' : 'Send Reset Link'}
          onPress={onSubmit}
          disabled={!isFormValid || isSubmitting}
          pressedEnabled={isFormValid}
        />
      </Animated.View>

      <View style={styles.switchRow}>
        <Text style={styles.switchText}>Remember your password? </Text>
        <Pressable onPress={onSignIn}>
          <Text style={styles.switchLink}>Sign in</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
  fieldWrap: { marginBottom: GRID * 2 },
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
  inputRowError: { borderColor: C.wine },
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
  inputFilled: { fontFamily: 'Urbanist_600SemiBold' },
  fieldError: {
    marginTop: GRID * 0.5,
    fontSize: 12,
    fontWeight: '600',
    color: '#FDE2D5',
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
    color: C.white,
  },
});
