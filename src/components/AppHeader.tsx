import { StyleSheet, View } from 'react-native';
import { HeaderDmBellActions } from './HeaderDmBellActions';
import { Text } from './Typography';
import { businessDetailColors } from './business-detail/styles';
import { FROSTED_CARD_BORDER_COLOR } from '../styles/cardSurface';

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
      {showBell ? <HeaderDmBellActions /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
    backgroundColor: businessDetailColors.coral,
    borderBottomWidth: 1,
    borderBottomColor: FROSTED_CARD_BORDER_COLOR,
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: businessDetailColors.white,
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 12,
    color: businessDetailColors.page,
    marginTop: 4,
    letterSpacing: 1.5,
  },
});
