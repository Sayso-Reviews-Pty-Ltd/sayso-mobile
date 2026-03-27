import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, TextInput } from '../../../../components/Typography';
import { C, FIELD_ICON_SIZE } from '../constants';
import { styles } from '../LoginScreen.styles';
import type { FocusedField } from '../types';

type Props = {
  focusedField: FocusedField;
  username: string;
  usernameError: string;
  usernameIsValid: boolean;
  usernameAvailable: boolean | null;
  usernameChecking: boolean;
  usernameCheckFailed: boolean;
  onChangeUsername: (value: string) => void;
  onFocusField: (field: Exclude<FocusedField, null>) => void;
  onBlurUsername: () => void;
};

export function UsernameField({
  focusedField,
  username,
  usernameError,
  usernameIsValid,
  usernameAvailable,
  usernameChecking: _usernameChecking,
  usernameCheckFailed,
  onChangeUsername,
  onFocusField,
  onBlurUsername,
}: Props) {
  return (
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
  );
}
