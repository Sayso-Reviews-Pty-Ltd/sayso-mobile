import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { FeaturedBusinessDto } from '@sayso/contracts';
import { Text } from '../../../../components/Typography';
import { HomeBusinessRow } from '../HomeBusinessRow';
import { homeTokens } from '../HomeTokens';
import { styles } from './styles';

type Props = {
  featuredBusinesses: FeaturedBusinessDto[];
  featuredLoading: boolean;
  featuredError?: string | null;
  onPressFeatured: () => void;
};

export function FeaturedBusinessesStrip({
  featuredBusinesses,
  featuredLoading,
  featuredError,
  onPressFeatured,
}: Props) {
  return (
    <View style={styles.subsection}>
      <View style={styles.subsectionTop}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Featured Businesses</Text>
        </View>
        <TouchableOpacity
          style={[styles.subsectionActionButton, styles.subsectionActionButtonWithIcon]}
          onPress={onPressFeatured}
          activeOpacity={0.8}
        >
          <Text style={styles.subsectionAction}>See More</Text>
          <Ionicons
            name="arrow-forward-outline"
            size={14}
            color={homeTokens.coral}
            style={styles.subsectionActionIcon}
          />
        </TouchableOpacity>
      </View>

      <HomeBusinessRow
        items={featuredBusinesses}
        loading={featuredLoading}
        error={featuredError}
        emptyTitle="Curated by trust and completeness."
        emptyMessage="As the community grows, this will highlight rising businesses worth exploring."
        contentPaddingBottom={0}
      />
    </View>
  );
}
