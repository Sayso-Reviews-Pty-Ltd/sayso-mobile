import { TouchableOpacity, View } from 'react-native';
import { TransitionItem } from '../../../components/motion/TransitionItem';
import { Text } from '../../../components/Typography';
import { HomeSearchBar } from '../../tabs/home/HomeSearchBar';
import { styles } from './trendingStyles';

type Props = {
  activeFilterCount: number;
  hasSearchAndFilters: boolean;
  inputValue: string;
  isFetching: boolean;
  onClear: () => void;
  onClearEverything: () => void;
  onInputChange: (text: string) => void;
};

export function TrendingSearchHeader({
  activeFilterCount,
  hasSearchAndFilters,
  inputValue,
  isFetching,
  onClear,
  onClearEverything,
  onInputChange,
}: Props) {
  return (
    <>
      <TransitionItem role="hero" index={0}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Trending Now</Text>
          <Text style={styles.heroDesc}>See what's hot right now!</Text>
        </View>
      </TransitionItem>

      <TransitionItem role="subheading" index={1}>
        <View style={styles.searchWrap}>
          <HomeSearchBar
            value={inputValue}
            onChangeText={onInputChange}
            onClear={onClear}
            isFetching={isFetching}
            activeFilterCount={activeFilterCount}
          />
          {hasSearchAndFilters ? (
            <TouchableOpacity style={styles.clearEverythingButton} onPress={onClearEverything} activeOpacity={0.86}>
              <Text style={styles.clearEverythingButtonText}>Clear everything</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </TransitionItem>
    </>
  );
}
