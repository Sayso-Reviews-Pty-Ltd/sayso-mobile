import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../components/Typography';

const GRID = 8;
const C = { wine: '#722F37', sage: '#7D9B76', white: '#FFFFFF' };

export function ChangePasswordSuccessState() {
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      <View style={styles.circle}>
        <Ionicons name="checkmark-outline" size={36} color={C.sage} />
      </View>
      <Text style={styles.msg}>All set! Your password is now updated.</Text>
      <Pressable style={styles.btn} onPress={() => router.back()}>
        <LinearGradient
          colors={[C.wine, 'rgba(114,47,55,0.8)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Text style={styles.btnTxt}>Done</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: GRID * 2 },
  circle: {
    width: 80, height: 80, borderRadius: 999,
    backgroundColor: 'rgba(125,155,118,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  msg: { fontSize: 14, lineHeight: 22, color: 'rgba(255,255,255,0.88)', textAlign: 'center', fontWeight: '400', paddingHorizontal: GRID },
  btn: { width: '100%', borderRadius: 999, overflow: 'hidden', shadowColor: C.wine, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 14, elevation: 6 },
  gradient: { minHeight: GRID * 7, paddingVertical: GRID * 1.5, alignItems: 'center', justifyContent: 'center' },
  btnTxt: { fontSize: 16, fontWeight: '600', color: C.white },
});
