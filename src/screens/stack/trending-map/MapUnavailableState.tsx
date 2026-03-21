import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/Typography';
import { styles } from './styles';

export function MapUnavailableState() {
  return (
    <View style={styles.container}>
      <View style={styles.unavailableWrap}>
        <View style={styles.unavailableIconWrap}>
          <Ionicons name="map-outline" size={18} color="#722F37" />
        </View>
        <Text style={styles.unavailableTitle}>Map unavailable in Expo Go</Text>
        <Text style={styles.unavailableText}>
          Use a development build to enable the interactive map.
        </Text>
      </View>
    </View>
  );
}
