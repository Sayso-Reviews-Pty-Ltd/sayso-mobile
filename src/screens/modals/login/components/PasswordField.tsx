import { type RefObject, type ElementRef } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, TextInput } from '../../../../components/Typography';
import { C, FIELD_ICON_SIZE, STRENGTH_COLORS, STRENGTH_LABELS } from '../constants';
import { styles } from '../LoginScreen.styles';
import type { FocusedField } from '../types';

type Props = {
  isRegister: boolean;
  focusedField: FocusedField;
  password: string;
  passwordHasState: boolean;
  pwScore: number;
  passwordVisible: boolean;
  passwordTouched: boolean;
  passwordInputRef: RefObject<ElementRef<typeof TextInput> | null>;
  onChangePassword: (value: string) => void;
  onFocusField: (field: Exclude<FocusedField, null>) => void;
  onBlurPassword: () => void;
  onTogglePasswordVisibility: () => void;
  onSubmit: () => void;
};

export function PasswordField({
  isRegister,
  focusedField,
  password,
  passwordHasState,
  pwScore,
  passwordVisible,
  passwordTouched,
  passwordInputRef,
  onChangePassword,
  onFocusField,
  onBlurPassword,
  onTogglePasswordVisibility,
  onSubmit,
}: Props) {
  return (
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
  );
}
