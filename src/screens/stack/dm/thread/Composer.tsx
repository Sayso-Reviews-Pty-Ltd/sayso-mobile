import { Pressable, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, GRID } from './constants';
import { styles } from './styles';

type Props = {
  inputText: string;
  insetBottom: number;
  onChangeText: (text: string) => void;
  onSend: () => void;
};

export function Composer({ inputText, insetBottom, onChangeText, onSend }: Props) {
  const isDisabled = !inputText.trim();

  return (
    <View style={[styles.inputBar, { paddingBottom: insetBottom + GRID }]}>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={onChangeText}
          placeholder="Message…"
          placeholderTextColor={C.charcoal50}
          multiline
          maxLength={2000}
          returnKeyType="default"
          blurOnSubmit={false}
        />
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.sendBtn,
          isDisabled ? styles.sendBtnDisabled : null,
          pressed && !isDisabled ? styles.sendBtnPressed : null,
        ]}
        onPress={onSend}
        disabled={isDisabled}
      >
        <Ionicons
          name="arrow-up-outline"
          size={20}
          color={isDisabled ? C.charcoal50 : C.white}
        />
      </Pressable>
    </View>
  );
}
