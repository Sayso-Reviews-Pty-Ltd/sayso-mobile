import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BusinessCard } from '../../../../components/BusinessCard';
import { Text } from '../../../../components/Typography';
import { CORAL, CHARCOAL } from '../constants';
import { ProfileSectionCard } from './ProfileSectionCard';

type Props = {
  savedBusinesses: any[];
  onViewAll: () => void;
};

export function ProfileSavedBusinessesSection({ savedBusinesses, onViewAll }: Props) {
  if (savedBusinesses.length === 0) return null;

  return (
    <ProfileSectionCard>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeaderLeft}>
          <View style={styles.sectionIconCircle}>
            <Ionicons name="bookmark-outline" size={14} color="rgba(45,45,45,0.84)" />
          </View>
          <Text style={styles.sectionTitle}>Saved Businesses</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{savedBusinesses.length}</Text>
          </View>
        </View>
        <Pressable style={styles.inlineLink} onPress={onViewAll}>
          <Text style={styles.inlineLinkText}>View all</Text>
          <Ionicons name="chevron-forward-outline" size={14} color={CORAL} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.savedPreviewRow}
      >
        {savedBusinesses.map((business) => (
          <View key={business.id} style={styles.savedBusinessCardWrap}>
            <BusinessCard business={business} />
            <View style={styles.savedIndicator}>
              <Ionicons name="bookmark-outline" size={12} color="#FFFFFF" />
            </View>
          </View>
        ))}
      </ScrollView>
    </ProfileSectionCard>
  );
}

const styles = StyleSheet.create({
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  sectionIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(229,224,229,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    color: CHARCOAL,
    fontWeight: '700',
  },
  countBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(229,224,229,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontSize: 12,
    color: '#7D9B76',
    fontWeight: '700',
  },
  inlineLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  inlineLinkText: {
    color: CORAL,
    fontSize: 12,
    fontWeight: '700',
  },
  savedPreviewRow: {
    gap: 12,
    paddingBottom: 4,
    paddingTop: 2,
  },
  savedBusinessCardWrap: {
    width: 314,
  },
  savedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#7D9B76',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
