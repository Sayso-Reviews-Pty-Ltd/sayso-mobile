import { Pressable, StyleSheet, View } from 'react-native';
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

type Field = 'current' | 'new' | 'confirm';

interface Props {
  field: Field;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  fieldError: string;
  focused: Field | null;
  visible: boolean;
  isSignedOut: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onToggleVisible: () => void;
  extraProps?: object;
}

export function ChangePasswordField({
  field, label, value, onChange, placeholder, fieldError,
  focused, visible, isSignedOut,
  onFocus, onBlur, onToggleVisible,
  extraProps,
}: Props) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[
        styles.inputRow,
        focused === field && styles.inputRowFocused,
        fieldError ? styles.inputRowError : null,
      ]}>
        <Ionicons
          name={fieldError ? 'alert-circle' : 'lock-closed'}
          size={ICON_SIZE}
          color={fieldError ? C.wine : focused === field ? C.sage : C.charcoal60}
          style={styles.inputLeftIcon}
        />
        <TextInput
          style={[styles.input, value && styles.inputFilled]}
          value={value}
          onChangeText={onChange}
          editable={!isSignedOut}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={C.charcoal50}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          {...extraProps}
        />
        <Pressable
          style={[styles.eyeBtn, isSignedOut ? styles.eyeBtnDisabled : null]}
          onPress={onToggleVisible}
          hitSlop={8}
          disabled={isSignedOut}
        >
          <Ionicons name={visible ? 'eye-off' : 'eye'} size={ICON_SIZE} color={C.charcoal60} />
        </Pressable>
      </View>
      {!!fieldError && <Text style={styles.fieldError}>{fieldError}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldWrap: { marginBottom: GRID * 2 },
  fieldLabel: { marginBottom: GRID, fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.93)' },
  inputRow: {
    minHeight: GRID * 7, justifyContent: 'center', borderRadius: 999,
    backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.inputBorder,
  },
  inputRowError: { borderColor: C.wine },
  inputRowFocused: {
    borderColor: C.wine, shadowColor: C.wine,
    shadowOpacity: 0.16, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 2,
  },
  inputLeftIcon: { position: 'absolute', left: GRID * 2, top: '50%', marginTop: -(ICON_SIZE / 2), zIndex: 2 },
  input: {
    paddingLeft: GRID * 5.75, paddingRight: GRID * 6,
    paddingVertical: GRID * 1.75, fontSize: 16, color: C.charcoal,
    fontFamily: 'Urbanist_400Regular', borderRadius: 999,
  },
  inputFilled: { fontFamily: 'Urbanist_600SemiBold' },
  fieldError: { marginTop: GRID * 0.5, fontSize: 12, fontWeight: '600', color: '#FDE2D5' },
  eyeBtn: { position: 'absolute', right: GRID * 1.75, top: 0, bottom: 0, justifyContent: 'center' },
  eyeBtnDisabled: { opacity: 0.5 },
});
