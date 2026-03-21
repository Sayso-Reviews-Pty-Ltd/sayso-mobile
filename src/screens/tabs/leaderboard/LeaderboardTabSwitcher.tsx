import { Pressable, View } from 'react-native';
import { Text } from '../../../components/Typography';
import { styles } from './styles';

type Tab = 'contributors' | 'businesses';

type Props = {
  activeTab: Tab;
  onChangeTab: (tab: Tab) => void;
};

export function LeaderboardTabSwitcher({ activeTab, onChangeTab }: Props) {
  return (
    <View style={styles.tabContainer}>
      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tab, activeTab === 'contributors' && styles.tabActive]}
          onPress={() => onChangeTab('contributors')}
        >
          <Text style={[styles.tabText, activeTab === 'contributors' && styles.tabTextActive]}>
            Top Contributors
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'businesses' && styles.tabActive]}
          onPress={() => onChangeTab('businesses')}
        >
          <Text style={[styles.tabText, activeTab === 'businesses' && styles.tabTextActive]}>
            Top Businesses
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
