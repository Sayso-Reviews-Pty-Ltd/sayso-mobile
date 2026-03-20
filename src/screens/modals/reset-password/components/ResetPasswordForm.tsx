import { Animated, Pressable, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../../components/Typography';
import { C, FIELD_ICON_SIZE } from '../constants';
import { getPasswordStrengthLabel, getStrengthColor } from '../helpers';
import { styles } from '../ResetPasswordScreen.styles';
import type { FocusedField } from '../types';

type Props = {
  error: string;
  password: string;
  confirmPassword: string;
  passwordVisible: boolean;
  confirmVisible: boolean;
  focusedField: FocusedField;
  passwordError: string;
  confirmError: string;
  pwScore: number;
  isFormValid: boolean;
  isSubmitting: boolean;
  primaryScale: Animated.Value;
  onChangePassword: (value: string) => void;
  onChangeConfirmPassword: (value: string) => void;
  onFocusField: (field: Exclude<FocusedField, null>) => void;
  onBlurPassword: () => void;
  onBlurConfirmPassword: () => void;
  onTogglePasswordVisible: () => void;
  onToggleConfirmVisible: () => void;
  onSubmit: () => void;
};

export function ResetPasswordForm({
  error,
  password,
  confirmPassword,
  passwordVisible,
  confirmVisible,
  focusedField,
  passwordError,
  confirmError,
  pwScore,
  isFormValid,
  isSubmitting,
  primaryScale,
  onChangePassword,
  onChangeConfirmPassword,
  onFocusField,
  onBlurPassword,
  onBlurConfirmPassword,
  onTogglePasswordVisible,
  onToggleConfirmVisible,
  onSubmit,
}: Props) {
  const getPasswordIcon = () => {
    if (!password.length) return 'lock-closed';
    if (pwScore >= 3) return 'checkmark-circle';
    return 'alert-circle';
  };

  const getPasswordIconColor = () => {
    if (passwordError) return C.wine;
    if (!password.length) return focusedField === 'password' ? C.sage : C.charcoal60;
    if (pwScore >= 3) return C.sage;
    return C.amber;
  };

  return (
    <>
      {!!error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color={C.errorText} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>New Password</Text>
        <View
          style={[
            styles.inputRow,
            focusedField === 'password' ? styles.inputRowFocused : null,
            passwordError ? styles.inputRowError : null,
          ]}
        >
          <Ionicons
            name={getPasswordIcon()}
            size={FIELD_ICON_SIZE}
            color={getPasswordIconColor()}
            style={styles.inputLeftIcon}
          />
          <TextInput
            style={[styles.input, styles.passwordInput, password ? styles.inputFilled : null]}
            value={password}
            onChangeText={onChangePassword}
            onFocus={() => onFocusField('password')}
            onBlur={onBlurPassword}
            placeholder="Create a password"
            placeholderTextColor={C.charcoal50}
            secureTextEntry={!passwordVisible}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            returnKeyType="next"
          />
          <Pressable style={styles.eyeBtn} onPress={onTogglePasswordVisible} hitSlop={8}>
            <Ionicons
              name={passwordVisible ? 'eye-off' : 'eye'}
              size={FIELD_ICON_SIZE}
              color={C.charcoal60}
            />
          </Pressable>
        </View>
        {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}
        {!passwordError && password.length > 0 ? (
          <View style={styles.strengthWrap}>
            <View style={styles.strengthBars}>
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.strengthBar,
                    {
                      backgroundColor: i <= pwScore ? getStrengthColor(pwScore) : 'rgba(45,45,45,0.16)',
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.strengthLabel, { color: getStrengthColor(pwScore) }]}>
              {getPasswordStrengthLabel(pwScore)}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>Confirm Password</Text>
        <View
          style={[
            styles.inputRow,
            focusedField === 'confirm' ? styles.inputRowFocused : null,
            confirmError ? styles.inputRowError : null,
          ]}
        >
          <Ionicons
            name={
              confirmError
                ? 'alert-circle'
                : confirmPassword && confirmPassword === password
                  ? 'checkmark-circle'
                  : 'lock-closed'
            }
            size={FIELD_ICON_SIZE}
            color={
              confirmError
                ? C.wine
                : confirmPassword && confirmPassword === password
                  ? C.sage
                  : focusedField === 'confirm'
                    ? C.sage
                    : C.charcoal60
            }
            style={styles.inputLeftIcon}
          />
          <TextInput
            style={[styles.input, styles.passwordInput, confirmPassword ? styles.inputFilled : null]}
            value={confirmPassword}
            onChangeText={onChangeConfirmPassword}
            onFocus={() => onFocusField('confirm')}
            onBlur={onBlurConfirmPassword}
            placeholder="Confirm your password"
            placeholderTextColor={C.charcoal50}
            secureTextEntry={!confirmVisible}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />
          <Pressable style={styles.eyeBtn} onPress={onToggleConfirmVisible} hitSlop={8}>
            <Ionicons
              name={confirmVisible ? 'eye-off' : 'eye'}
              size={FIELD_ICON_SIZE}
              color={C.charcoal60}
            />
          </Pressable>
        </View>
        {confirmError ? <Text style={styles.fieldError}>{confirmError}</Text> : null}
      </View>

      <Animated.View style={{ transform: [{ scale: primaryScale }] }}>
        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            !isFormValid || isSubmitting ? styles.submitBtnDisabled : null,
            pressed && isFormValid ? styles.submitBtnPressed : null,
          ]}
          onPress={onSubmit}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={[C.wine, 'rgba(114,47,55,0.8)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitBtnGradient}
          >
            <Text style={styles.submitTxt}>{isSubmitting ? 'Updating…' : 'Update Password'}</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </>
  );
}
