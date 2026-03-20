import { type RefObject } from 'react';
import { Animated, Pressable, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../../components/Typography';
import { C, FIELD_ICON_SIZE, STRENGTH_COLORS, STRENGTH_LABELS } from '../constants';
import { styles } from '../LoginScreen.styles';
import type { FocusedField } from '../types';

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
  passwordInputRef: RefObject<TextInput | null>;
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
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Username</Text>
          <View
            style={[
              styles.inputRow,
              focusedField === 'username' ? styles.inputRowFocused : null,
              usernameError ? styles.inputRowError : null,
            ]}
          >
            <View style={styles.inputLeftIcon}>
              <Ionicons
                name={usernameError ? 'alert-circle' : usernameIsValid ? 'checkmark-circle' : 'person'}
                size={FIELD_ICON_SIZE}
                color={
                  usernameError
                    ? C.wine
                    : usernameIsValid
                      ? C.sage
                      : focusedField === 'username'
                        ? C.sage
                        : C.charcoal60
                }
              />
            </View>
            <TextInput
              style={[styles.input, username ? styles.inputFilled : null]}
              value={username}
              onChangeText={onChangeUsername}
              onFocus={() => onFocusField('username')}
              onBlur={onBlurUsername}
              placeholder="e.g. johndoe"
              placeholderTextColor={C.charcoal50}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username-new"
              returnKeyType="next"
            />
          </View>
          {usernameError ? <Text style={styles.fieldError}>{usernameError}</Text> : null}
          {!usernameError && usernameAvailable === false ? (
            <Text style={styles.fieldError}>That username is already taken</Text>
          ) : null}
          {!usernameError && usernameCheckFailed ? (
            <Text style={styles.fieldError}>Couldn't verify username — you can still continue</Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>Email</Text>
        <View
          style={[
            styles.inputRow,
            focusedField === 'email' ? styles.inputRowFocused : null,
            emailError ? styles.inputRowError : null,
          ]}
        >
          <View style={styles.inputLeftIcon}>
            <Ionicons
              name={emailError ? 'alert-circle' : emailIsValid ? 'checkmark-circle' : 'mail'}
              size={FIELD_ICON_SIZE}
              color={
                emailError
                  ? C.wine
                  : emailIsValid
                    ? C.sage
                    : focusedField === 'email'
                      ? C.sage
                      : C.charcoal60
              }
            />
          </View>
          <TextInput
            style={[styles.input, email ? styles.inputFilled : null]}
            value={email}
            onChangeText={onChangeEmail}
            onFocus={() => onFocusField('email')}
            onBlur={onBlurEmail}
            placeholder="you@example.com"
            placeholderTextColor={C.charcoal50}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current?.focus()}
          />
        </View>
        {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>Password</Text>
        <View
          style={[
            styles.inputRow,
            focusedField === 'password' ? styles.inputRowFocused : null,
            !isRegister && passwordTouched && password.length === 0 ? styles.inputRowError : null,
          ]}
        >
          <View style={styles.inputLeftIcon}>
            <Ionicons
              name={!passwordHasState ? 'lock-closed' : pwScore >= 3 ? 'checkmark-circle' : 'alert-circle'}
              size={FIELD_ICON_SIZE}
              color={
                !passwordHasState
                  ? focusedField === 'password'
                    ? C.sage
                    : C.charcoal60
                  : pwScore >= 3
                    ? C.sage
                    : '#F59E0B'
              }
            />
          </View>
          <TextInput
            ref={passwordInputRef}
            style={[styles.input, password ? styles.inputFilled : null, styles.passwordInput]}
            value={password}
            onChangeText={onChangePassword}
            placeholder={isRegister ? 'Create a password' : 'Enter your password'}
            placeholderTextColor={C.charcoal50}
            secureTextEntry={!passwordVisible}
            onFocus={() => onFocusField('password')}
            onBlur={onBlurPassword}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            textContentType={isRegister ? 'newPassword' : 'password'}
            returnKeyType="done"
            maxLength={128}
            onSubmitEditing={onSubmit}
          />
          <Pressable style={styles.eyeBtn} onPress={onTogglePasswordVisibility} hitSlop={4}>
            <Ionicons name={passwordVisible ? 'eye-off' : 'eye'} size={FIELD_ICON_SIZE} color={C.charcoal60} />
          </Pressable>
        </View>
        {isRegister && password.length > 0 ? (
          <View style={styles.strengthWrap}>
            <View style={styles.strengthBars}>
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.strengthBar,
                    { backgroundColor: i <= pwScore ? STRENGTH_COLORS[pwScore] : 'rgba(45,45,45,0.16)' },
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.strengthLabel, { color: STRENGTH_COLORS[pwScore] || C.charcoal50 }]}>
              {STRENGTH_LABELS[pwScore] ?? ''}
            </Text>
          </View>
        ) : null}
        {!isRegister && passwordTouched && password.length === 0 ? (
          <Text style={styles.fieldError}>Password is required</Text>
        ) : !isRegister && passwordTouched && password.length > 0 && password.length < 6 ? (
          <Text style={styles.fieldError}>Password must be at least 6 characters</Text>
        ) : null}
      </View>

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
