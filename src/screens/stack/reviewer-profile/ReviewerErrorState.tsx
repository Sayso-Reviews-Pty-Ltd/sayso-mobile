import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/Typography';
import { C } from './constants';
import { styles } from './styles';

type Props = {
  onBack: () => void;
};

export function ReviewerErrorState({ onBack }: Props) {
  return (
    <View style={styles.errorState}>
      <Ionicons name="person-outline" size={48} color={C.charcoal50} />
      <Text style={styles.errorTitle}>Reviewer not found</Text>
      <Text style={styles.errorSubtitle}>This profile may have been removed or is unavailable.</Text>
      <Pressable style={styles.errorBack} onPress={onBack}>
        <Text style={styles.errorBackText}>Go back</Text>
      </Pressable>
    </View>
  );
}
