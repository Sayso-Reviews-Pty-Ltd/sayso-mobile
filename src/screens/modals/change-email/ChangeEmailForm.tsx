import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../components/Typography';
import { ChangeEmailField } from './ChangeEmailField';

const GRID = 8;
const C = {
  wine: '#722F37',
  white: '#FFFFFF',
  errorText: '#722F37',
  errorBg: 'rgba(229,224,229,0.95)',
  errorBorder: 'rgba(114,47,55,0.35)',
};

interface Props {
  newEmail: string;
  setNewEmail: (v: string) => void;
  setTouched: (v: boolean) => void;
  fieldError: string;
  error: string;
  isValid: boolean;
  formDisabled: boolean;
  isPending: boolean;
  handleSubmit: () => void;
}

export function ChangeEmailForm({
  newEmail,
  setNewEmail,
  setTouched,
  fieldError,
  error,
  isValid,
  formDisabled,
  isPending,
  handleSubmit,
}: Props) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <>
      {!!error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color={C.errorText} />
          <Text style={styles.errorText} accessibilityRole="alert" accessibilityLiveRegion="polite">
            {error}
          </Text>
        </View>
      )}

      <ChangeEmailField
        label="New Email Address"
        value={newEmail}
        onChange={setNewEmail}
        placeholder="your@email.com"
        fieldError={fieldError}
        isFocused={isFocused}
        disabled={formDisabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          setTouched(true);
        }}
        onSubmitEditing={handleSubmit}
        accessibilityLabel="New email address input"
      />

      <Pressable
        style={({ pressed }) => [
          styles.submitBtn,
          (!isValid || formDisabled) && styles.submitBtnDisabled,
          pressed && isValid && !formDisabled && styles.submitBtnPressed,
        ]}
        onPress={handleSubmit}
        disabled={formDisabled}
        accessibilityRole="button"
        accessibilityLabel={isPending ? 'Sending verification email' : 'Send verification email'}
        accessibilityState={{ disabled: formDisabled }}
      >
        <LinearGradient
          colors={[C.wine, 'rgba(114,47,55,0.8)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.btnGradient}
        >
          <Text style={styles.btnTxt}>
            {isPending ? 'Sending…' : 'Send Verification Email'}
          </Text>
        </LinearGradient>
      </Pressable>
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
  submitBtn: {
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: C.wine,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  submitBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },
  submitBtnPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  btnGradient: {
    minHeight: GRID * 7,
    paddingVertical: GRID * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: { fontSize: 16, fontWeight: '600', color: C.white },
});
