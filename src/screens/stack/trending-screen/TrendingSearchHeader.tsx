import { View } from 'react-native';
import { TransitionItem } from '../../../components/motion/TransitionItem';
import { Text } from '../../../components/Typography';
import { HomeSearchBar } from '../../tabs/home/HomeSearchBar';
import { styles } from './trendingStyles';

type Props = {
  inputValue: string;
  isFetching: boolean;
  onClear: () => void;
  onInputChange: (text: string) => void;
};

export function TrendingSearchHeader({ inputValue, isFetching, onClear, onInputChange }: Props) {
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
          />
        </View>
      </TransitionItem>
    </>
  );
}
