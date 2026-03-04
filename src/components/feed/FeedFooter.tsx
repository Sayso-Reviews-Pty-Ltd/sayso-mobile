import { StyleSheet, View } from 'react-native';
import { Text } from '../Typography';

export function FeedFooter() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>You've reached the end for now.</Text>
      <Text style={styles.message}>Check back later for more places to explore.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
  },
  message: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    textAlign: 'center',
  },
});
