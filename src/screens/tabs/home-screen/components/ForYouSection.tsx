import { TouchableOpacity, type StyleProp, type ViewStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { BusinessListItemDto } from '@sayso/contracts';
import { CardSurface } from '../../../../components/CardSurface';
import { Text } from '../../../../components/Typography';
import { HomeBusinessRow } from '../../home/HomeBusinessRow';
import { HomeSectionHeader } from '../../home/HomeSectionHeader';
import { homeTokens } from '../../home/HomeTokens';
import { CARD_RADIUS } from '../../../../styles/radii';
import { styles } from '../HomeScreenView.styles';

type Props = {
  user: { id: string } | null;
  forYou: {
    businesses: BusinessListItemDto[];
    isLoading: boolean;
    error: string | null;
  };
  onNavigateForYou: () => void;
  onNavigateOnboarding: () => void;
  ctaShadowStyle: StyleProp<ViewStyle>;
};

export function ForYouSection({
  user,
  forYou,
  onNavigateForYou,
  onNavigateOnboarding,
  ctaShadowStyle,
}: Props) {
  return (
    <View style={styles.section}>
      <HomeSectionHeader
        title="For You"
        actionLabel={user ? 'See More' : undefined}
        onPress={user ? onNavigateForYou : undefined}
      />

      {!user ? (
        <CardSurface
          radius={CARD_RADIUS}
          style={styles.guestCardWrap}
          contentStyle={styles.guestCardSurface}
        >
          <LinearGradient
            colors={[homeTokens.coral, homeTokens.coralDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.guestCard}
          >
            <View style={styles.guestBadge}>
              <Text style={styles.guestBadgeText}>For You</Text>
            </View>
            <Text style={styles.guestTitle}>Create an account to unlock personalised recommendations.</Text>
            <View style={styles.guestActions}>
              <TouchableOpacity
                style={[styles.primaryGuestButton, ctaShadowStyle]}
                onPress={onNavigateOnboarding}
                activeOpacity={0.88}
              >
                <Text style={styles.primaryGuestButtonText}>Create Account</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryGuestButton, ctaShadowStyle]}
                onPress={onNavigateOnboarding}
                activeOpacity={0.88}
              >
                <Text style={styles.secondaryGuestButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </CardSurface>
      ) : forYou.error ? (
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Could not load personalised picks right now.</Text>
          <Text style={styles.messageText}>We will retry in the background.</Text>
        </View>
      ) : forYou.isLoading ? (
        <HomeBusinessRow
          items={[]}
          loading
          emptyTitle="Curated from your interests"
          emptyMessage="Based on what you selected, no matches in this section yet. See more on For You or explore Trending."
        />
      ) : forYou.businesses.length > 0 ? (
        <HomeBusinessRow
          items={forYou.businesses}
          loading={false}
          emptyTitle="Curated from your interests"
          emptyMessage="Based on what you selected, no matches in this section yet. See more on For You or explore Trending."
        />
      ) : (
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Curated from your interests</Text>
          <Text style={styles.messageText}>
            Based on what you selected, no matches in this section yet. See more on For You or explore Trending.
          </Text>
        </View>
      )}
    </View>
  );
}
