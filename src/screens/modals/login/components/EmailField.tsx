import { type RefObject, type ElementRef } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, TextInput } from '../../../../components/Typography';
import { C, FIELD_ICON_SIZE } from '../constants';
import { styles } from '../LoginScreen.styles';
import type { FocusedField } from '../types';

type Props = {
  focusedField: FocusedField;
  email: string;
  emailError: string;
  emailIsValid: boolean;
  passwordInputRef: RefObject<ElementRef<typeof TextInput> | null>;
  onChangeEmail: (value: string) => void;
  onFocusField: (field: Exclude<FocusedField, null>) => void;
  onBlurEmail: () => void;
};

export function EmailField({
  focusedField,
  email,
  emailError,
  emailIsValid,
  passwordInputRef,
  onChangeEmail,
  onFocusField,
  onBlurEmail,
}: Props) {
  return (
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
  );
}
