import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/Typography';
import { homeTokens } from './HomeTokens';
import { CARD_RADIUS } from '../../../styles/radii';
import type { EnhancedProfileDto } from '../../../hooks/useProfile';

type TimeOfDay = 'morning' | 'afternoon' | 'evening';

function getTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const TIME_CONFIG: Record<TimeOfDay, {
  greeting: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  sub: string;
}> = {
  morning:   { greeting: 'Good morning',   icon: 'sunny-outline',        sub: 'Ready to discover something great today?' },
  afternoon: { greeting: 'Good afternoon', icon: 'partly-sunny-outline', sub: 'The perfect time to explore something new.' },
  evening:   { greeting: 'Good evening',   icon: 'moon-outline',         sub: 'Wind down with a great local experience.' },
};

type Props = {
  profile: EnhancedProfileDto | null | undefined;
  loading: boolean;
};

export function HomeGreetingCard({ profile, loading }: Props) {
  if (loading || !profile) return null;

  const name = profile.display_name || profile.username || null;
  const reviewCount = profile.review_count ?? profile.reviews_count ?? 0;
  const badgeCount = profile.badge_count ?? profile.badges_count ?? 0;
  const tod = getTimeOfDay();
  const { greeting, icon, sub } = TIME_CONFIG[tod];

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[homeTokens.coral, homeTokens.coralDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Decorative circle */}
        <View style={styles.decorCircle} pointerEvents="none" />

        <View style={styles.topRow}>
          <View style={styles.textBlock}>
            <Text style={styles.greeting} numberOfLines={1}>
              {greeting}{name ? `, ${name}` : ''}
            </Text>
            <Text style={styles.sub} numberOfLines={2}>
              {sub}
            </Text>
          </View>
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={26} color="rgba(255,255,255,0.9)" />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{reviewCount}</Text>
            <Text style={styles.statLabel}>{reviewCount === 1 ? 'review' : 'reviews'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{badgeCount}</Text>
            <Text style={styles.statLabel}>{badgeCount === 1 ? 'badge' : 'badges'}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: homeTokens.pageGutter,
    paddingTop: 16,
  },
  card: {
    borderRadius: CARD_RADIUS,
    padding: 16,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -48,
    right: -32,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: homeTokens.white,
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.75)',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: homeTokens.white,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
});
