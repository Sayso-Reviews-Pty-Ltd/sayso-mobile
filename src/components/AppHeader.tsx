import { StyleSheet, View } from 'react-native';
import { HeaderBellButton } from './HeaderBellButton';
import { Text } from './Typography';

type Props = {
  title: string;
  subtitle?: string;
  showBell?: boolean;
};

export function AppHeader({ title, subtitle, showBell = false }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {showBell ? <HeaderBellButton /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
  },
});
