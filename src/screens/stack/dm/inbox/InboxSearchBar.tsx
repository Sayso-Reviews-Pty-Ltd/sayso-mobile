import { Pressable, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { C } from './constants';
import { styles } from './styles';

export function InboxSearchBar({
  value,
  onChange,
  onClear,
}: {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <View style={styles.searchWrap}>
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={C.charcoal50} />
        <TextInput
          style={styles.searchInput}
          value={value}
          onChangeText={onChange}
          placeholder="Search conversations..."
          placeholderTextColor={C.charcoal50}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 ? (
          <Pressable
            onPress={() => {
              try {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              onClear();
            }}
            hitSlop={8}
          >
            <Ionicons name="close-circle-outline" size={16} color={C.charcoal50} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
