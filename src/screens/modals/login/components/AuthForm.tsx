import { type RefObject, type ElementRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, TextInput } from '../../../../components/Typography';
import { C } from '../constants';
import { styles } from '../LoginScreen.styles';
import type { FocusedField } from '../types';
import { UsernameField } from './UsernameField';
import { EmailField } from './EmailField';
import { PasswordField } from './PasswordField';

type Props = {
  isRegister: boolean;
  error: string;
  focusedField: FocusedField;
  username: string;
  usernameError: string;
  usernameIsValid: boolean;
  usernameAvailable: boolean | null;
  usernameChecking: boolean;
  usernameCheckFailed: boolean;
  email: string;
  emailError: string;
  emailIsValid: boolean;
  password: string;
  passwordHasState: boolean;
  pwScore: number;
  passwordVisible: boolean;
  passwordTouched: boolean;
  consent: boolean;
  isFormValid: boolean;
  isPending: boolean;
  isVerifying: boolean;
  isGoogleLoading: boolean;
  formOpacity: Animated.Value;
  formTranslateY: Animated.Value;
  primaryFocusScale: Animated.Value;
  passwordInputRef: RefObject<ElementRef<typeof TextInput> | null>;
  onChangeUsername: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onFocusField: (field: Exclude<FocusedField, null>) => void;
  onBlurUsername: () => void;
  onBlurEmail: () => void;
  onBlurPassword: () => void;
  onTogglePasswordVisibility: () => void;
  onToggleConsent: () => void;
  onSubmit: () => void;
  onGoogle: () => void;
  onForgotPassword: () => void;
  onTerms: () => void;
  onPrivacy: () => void;
  onSwitchMode: () => void;
};

export function AuthForm({
  isRegister,
  error,
  focusedField,
  username,
  usernameError,
  usernameIsValid,
  usernameAvailable,
  usernameChecking,
  usernameCheckFailed,
  email,
  emailError,
  emailIsValid,
  password,
  passwordHasState,
  pwScore,
  passwordVisible,
  passwordTouched,
  consent,
  isFormValid,
  isPending,
  isVerifying,
  isGoogleLoading,
  formOpacity,
  formTranslateY,
  primaryFocusScale,
  passwordInputRef,
  onChangeUsername,
  onChangeEmail,
  onChangePassword,
  onFocusField,
  onBlurUsername,
  onBlurEmail,
  onBlurPassword,
  onTogglePasswordVisibility,
  onToggleConsent,
  onSubmit,
  onGoogle,
  onForgotPassword,
  onTerms,
  onPrivacy,
  onSwitchMode,
}: Props) {
  const submitDisabled = !isFormValid || isVerifying || isPending || usernameChecking;

  return (
    <Animated.View style={{ opacity: formOpacity, transform: [{ translateY: formTranslateY }] }}>
      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color={C.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {isRegister ? (
        <UsernameField
          focusedField={focusedField}
          username={username}
          usernameError={usernameError}
          usernameIsValid={usernameIsValid}
          usernameAvailable={usernameAvailable}
          usernameChecking={usernameChecking}
          usernameCheckFailed={usernameCheckFailed}
          onChangeUsername={onChangeUsername}
          onFocusField={onFocusField}
          onBlurUsername={onBlurUsername}
        />
      ) : null}

      <EmailField
        focusedField={focusedField}
        email={email}
        emailError={emailError}
        emailIsValid={emailIsValid}
        passwordInputRef={passwordInputRef}
        onChangeEmail={onChangeEmail}
        onFocusField={onFocusField}
        onBlurEmail={onBlurEmail}
      />

      <PasswordField
        isRegister={isRegister}
        focusedField={focusedField}
        password={password}
        passwordHasState={passwordHasState}
        pwScore={pwScore}
        passwordVisible={passwordVisible}
        passwordTouched={passwordTouched}
        passwordInputRef={passwordInputRef}
        onChangePassword={onChangePassword}
        onFocusField={onFocusField}
        onBlurPassword={onBlurPassword}
        onTogglePasswordVisibility={onTogglePasswordVisibility}
        onSubmit={onSubmit}
      />

      {!isRegister ? (
        <Pressable onPress={onForgotPassword} style={styles.forgotWrap}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </Pressable>
      ) : null}

      {isRegister ? (
        <Pressable testID="consent-toggle" style={styles.consentRow} onPress={onToggleConsent}>
          <View style={[styles.checkbox, consent ? styles.checkboxChecked : null]}>
            {consent ? <Ionicons name="checkmark-outline" size={12} color={C.white} /> : null}
          </View>
          <Text style={styles.consentText}>
            I agree to the{' '}
            <Text style={styles.consentLink} onPress={onTerms}>
              Terms of Use
            </Text>{' '}
            and{' '}
            <Text style={styles.consentLink} onPress={onPrivacy}>
              Privacy Policy
            </Text>
          </Text>
        </Pressable>
      ) : null}

      <Animated.View style={{ transform: [{ scale: primaryFocusScale }] }}>
        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            submitDisabled ? styles.submitBtnDisabled : null,
            pressed && isFormValid && !usernameChecking && !isVerifying && !isPending ? styles.submitBtnPressed : null,
          ]}
          onPress={onSubmit}
          disabled={submitDisabled}
        >
          <LinearGradient
            colors={[C.coral, 'rgba(114,47,55,0.8)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitBtnGradient}
          >
            <Text style={styles.submitTxt}>
              {isVerifying
                ? 'Verifying'
                : isPending
                  ? 'Updating…'
                  : isRegister
                    ? 'Create account'
                    : 'Sign in'}
            </Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.googleBtn,
          pressed ? styles.googleBtnPressed : null,
          isGoogleLoading ? styles.submitBtnDisabled : null,
        ]}
        onPress={onGoogle}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <Text style={styles.googleTxt}>Connecting…</Text>
        ) : (
          <>
            <Ionicons name="logo-google" size={18} color="#DB4437" />
            <Text style={styles.googleTxt}>Google</Text>
          </>
        )}
      </Pressable>

      <View style={styles.switchRow}>
        <Text style={styles.switchText}>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
        </Text>
        <Pressable onPress={onSwitchMode}>
          <Text style={styles.switchLink}>{isRegister ? 'Log in' : 'Sign up'}</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
