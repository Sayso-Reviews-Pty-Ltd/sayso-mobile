import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SkeletonBlock } from '../../../../components/SkeletonBlock';
import { APP_PAGE_GUTTER } from '../../../../styles/layout';
import { CARD_BG, PROFILE_CARD_GRADIENT } from '../constants';
import { ProfileSectionCard } from './ProfileSectionCard';

export function ProfileSkeleton() {
  return (
    <>
      <LinearGradient
        colors={PROFILE_CARD_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroContent}>
          <SkeletonBlock style={{ width: 96, height: 96, borderRadius: 48 }} />
          <SkeletonBlock style={{ width: 190, height: 24, borderRadius: 12, marginTop: 16 }} />
          <SkeletonBlock style={{ width: 160, height: 13, borderRadius: 7, marginTop: 8 }} />
          <SkeletonBlock style={{ width: 220, height: 12, borderRadius: 7, marginTop: 10 }} />
          <SkeletonBlock style={{ width: 120, height: 40, borderRadius: 20, marginTop: 16 }} />
        </View>
      </LinearGradient>

      <View style={styles.statsGrid}>
        {[0, 1, 2, 3].map((index) => (
          <LinearGradient
            key={`profile-stat-skeleton-${index}`}
            colors={[CARD_BG, CARD_BG, 'rgba(157,171,155,0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCard}
          >
            <View style={styles.statTitleRow}>
              <SkeletonBlock style={{ width: 32, height: 32, borderRadius: 16 }} />
              <SkeletonBlock style={{ width: 74, height: 12, borderRadius: 6 }} />
            </View>
            <SkeletonBlock style={{ width: 46, height: 24, borderRadius: 10, marginTop: 8 }} />
            <SkeletonBlock style={{ width: 94, height: 12, borderRadius: 6, marginTop: 8 }} />
          </LinearGradient>
        ))}
      </View>

      {[0, 1, 2].map((index) => (
        <ProfileSectionCard key={`profile-section-skeleton-${index}`}>
          <SkeletonBlock style={{ width: 140, height: 18, borderRadius: 9, marginBottom: 14 }} />
          <SkeletonBlock style={{ width: '100%', height: 14, borderRadius: 7 }} />
          <SkeletonBlock style={{ width: '88%', height: 14, borderRadius: 7, marginTop: 10 }} />
        </ProfileSectionCard>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    marginHorizontal: APP_PAGE_GUTTER,
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
  },
  statsGrid: {
    marginHorizontal: APP_PAGE_GUTTER,
    marginTop: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48.4%',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  statTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
});
