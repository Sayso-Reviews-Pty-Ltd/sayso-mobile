import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, TextInput } from '../../../components/Typography';

const GRID = 8;
const ICON_SIZE = 18;

const C = {
  wine: '#722F37',
  sage: '#7D9B76',
  charcoal: '#2D2D2D',
  charcoal60: 'rgba(45,45,45,0.6)',
  charcoal50: 'rgba(45,45,45,0.5)',
  inputBg: 'rgba(255,255,255,0.95)',
  inputBorder: 'rgba(255,255,255,0.6)',
};

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  fieldError: string;
  isFocused: boolean;
  disabled: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onSubmitEditing?: () => void;
  accessibilityLabel?: string;
}

export function ChangeEmailField({
  label,
  value,
  onChange,
  placeholder,
  fieldError,
  isFocused,
  disabled,
  onFocus,
  onBlur,
  onSubmitEditing,
  accessibilityLabel,
}: Props) {
  const hasError = !!fieldError;

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          isFocused && styles.inputRowFocused,
          hasError && styles.inputRowError,
        ]}
      >
        <Ionicons
          name={hasError ? 'alert-circle' : 'mail'}
          size={ICON_SIZE}
          color={hasError ? C.wine : isFocused ? C.sage : C.charcoal60}
          style={styles.inputLeftIcon}
        />
        <TextInput
          style={[styles.input, value && styles.inputFilled]}
          value={value}
          onChangeText={onChange}
          editable={!disabled}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={C.charcoal50}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          returnKeyType="done"
          onSubmitEditing={onSubmitEditing}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityHint="Enter your new email address"
          accessibilityState={{ disabled }}
        />
      </View>
      {hasError && (
        <Text
          style={styles.fieldError}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {fieldError}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldWrap: { marginBottom: GRID * 2 },
  fieldLabel: {
    marginBottom: GRID,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.93)',
  },
  inputRow: {
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
    marginTop: -(ICON_SIZE / 2),
    zIndex: 2,
  },
  input: {
    paddingLeft: GRID * 5.75,
    paddingRight: GRID * 2,
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
});
