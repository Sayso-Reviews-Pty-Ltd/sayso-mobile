import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../components/Typography';
import { APP_PAGE_GUTTER } from '../../../../styles/layout';
import { CHARCOAL } from '../constants';
import { getPrestigeInfo, getNextMilestonePrompt } from '../../../../lib/prestige';
import { ProfileSectionCard } from './ProfileSectionCard';
import { XPBar } from './XPBar';

type Props = {
  reviewCount: number;
};

export function ProfilePrestigeBanner({ reviewCount }: Props) {
  const info = getPrestigeInfo(reviewCount);
  const prompt = getNextMilestonePrompt(info);

  return (
    <ProfileSectionCard style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.iconCircle, { backgroundColor: info.color + '22' }]}>
          <Ionicons
            name={info.icon as keyof typeof Ionicons.glyphMap}
            size={20}
            color={info.color}
          />
        </View>
        <View style={styles.labelWrap}>
          <Text style={[styles.tierLabel, { color: info.color }]}>{info.label}</Text>
          <Text style={styles.tagline}>{info.tagline}</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.round(info.progressPct * 100)}%` as `${number}%`, backgroundColor: info.color },
          ]}
        />
      </View>

      <Text style={styles.prompt}>
        {prompt ?? "You've reached Legend!"}
      </Text>

      <View style={styles.divider} />

      <XPBar />
    </ProfileSectionCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelWrap: {
    flex: 1,
    gap: 2,
  },
  tierLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: CHARCOAL,
  },
  tagline: {
    fontSize: 12,
    color: 'rgba(45,45,45,0.65)',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(45,45,45,0.12)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  prompt: {
    fontSize: 12,
    color: 'rgba(45,45,45,0.65)',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(45,45,45,0.08)',
    marginVertical: 12,
  },
});
