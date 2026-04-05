import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../components/Typography';
import { useUserPreferences } from '../../../../hooks/useUserPreferences';
import { CHARCOAL, CORAL } from '../constants';
import type { LocationCardStatus } from '../types';
import { ProfileSectionCard } from './ProfileSectionCard';

const INTEREST_LABELS: Record<string, string> = {
  'food-drink': 'Food & Drink',
  'beauty-wellness': 'Beauty & Wellness',
  'professional-services': 'Professional Services',
  travel: 'Travel',
  'outdoors-adventure': 'Outdoors & Adventure',
  'experiences-entertainment': 'Entertainment & Experiences',
  'arts-culture': 'Arts & Culture',
  'family-pets': 'Family & Pets',
  'shopping-lifestyle': 'Shopping & Lifestyle',
};

const SUBCATEGORY_LABELS: Record<string, string> = {
  restaurants: 'Restaurants',
  cafes: 'Cafés & Coffee',
  bars: 'Bars & Pubs',
  'fast-food': 'Fast Food',
  'fine-dining': 'Fine Dining',
  gyms: 'Gyms & Fitness',
  spas: 'Spas',
  salons: 'Hair Salons',
  wellness: 'Wellness Centers',
  'nail-salons': 'Nail Salons',
  'education-learning': 'Education & Learning',
  'transport-travel': 'Transport & Travel',
  'finance-insurance': 'Finance & Insurance',
  plumbers: 'Plumbers',
  electricians: 'Electricians',
  'legal-services': 'Legal Services',
  accommodation: 'Accommodation',
  transport: 'Transport',
  'travel-services': 'Travel Services',
  hiking: 'Hiking',
  cycling: 'Cycling',
  'water-sports': 'Water Sports',
  camping: 'Camping',
  'events-festivals': 'Events & Festivals',
  'sports-recreation': 'Sports & Recreation',
  nightlife: 'Nightlife',
  'comedy-clubs': 'Comedy Clubs',
  cinemas: 'Cinemas',
  museums: 'Museums',
  galleries: 'Art Galleries',
  theaters: 'Theaters',
  concerts: 'Concerts',
  'family-activities': 'Family Activities',
  'pet-services': 'Pet Services',
  childcare: 'Childcare',
  veterinarians: 'Veterinarians',
  fashion: 'Fashion & Clothing',
  electronics: 'Electronics',
  'home-decor': 'Home Decor',
  books: 'Books & Media',
};

const DEALBREAKER_LABELS: Record<string, string> = {
  trustworthiness: 'Trustworthiness',
  punctuality: 'Punctuality',
  friendliness: 'Friendliness',
  'value-for-money': 'Value for Money',
};

type Props = {
  locationStatus: LocationCardStatus;
  onRequestLocationPermission: () => void;
  onEditPreferences: () => void;
};

export function ProfilePreferencesSection({
  locationStatus,
  onRequestLocationPermission,
  onEditPreferences,
}: Props) {
  const { interests, subcategories, dealbreakers, isLoading } = useUserPreferences();

  return (
    <ProfileSectionCard>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeaderLeft}>
          <View style={styles.sectionIconCircle}>
            <Ionicons name="navigate-outline" size={14} color="rgba(45,45,45,0.84)" />
          </View>
          <Text style={styles.sectionTitle}>Preferences</Text>
        </View>
        <Pressable style={styles.editBtn} onPress={onEditPreferences}>
          <Ionicons name="create-outline" size={13} color="#FFFFFF" />
          <Text style={styles.editBtnText}>Edit</Text>
        </Pressable>
      </View>

      {/* Location distance row */}
      <View style={styles.preferenceRow}>
        <View style={styles.preferenceTextWrap}>
          <Text style={styles.preferenceTitle}>Location Distance</Text>
          <Text style={styles.preferenceDescription}>
            {locationStatus === 'granted'
              ? 'Enabled - distances are shown on business cards.'
              : locationStatus === 'denied'
                ? 'Blocked - update in your device settings, then tap retry.'
                : 'Allow location to see how far businesses are from you.'}
          </Text>
        </View>

        {locationStatus === 'granted' ? (
          <View style={styles.enabledPill}>
            <Ionicons name="checkmark-outline" size={13} color="#7D9B76" />
            <Text style={styles.enabledPillText}>Enabled</Text>
          </View>
        ) : (
          <Pressable
            style={styles.preferenceButton}
            onPress={onRequestLocationPermission}
            disabled={locationStatus === 'loading'}
          >
            <Ionicons name="navigate-outline" size={13} color="#FFFFFF" />
            <Text style={styles.preferenceButtonText}>
              {locationStatus === 'loading'
                ? 'Requesting...'
                : locationStatus === 'denied'
                  ? 'Retry'
                  : 'Allow'}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Interests / subcategories / dealbreakers */}
      <PreferenceRow
        label="Interests"
        ids={interests.map((i) => i.id)}
        labelMap={INTEREST_LABELS}
        isLoading={isLoading}
      />
      <PreferenceRow
        label="Subcategories"
        ids={subcategories.map((s) => s.id)}
        labelMap={SUBCATEGORY_LABELS}
        isLoading={isLoading}
      />
      <PreferenceRow
        label="Dealbreakers"
        ids={dealbreakers.map((d) => d.id)}
        labelMap={DEALBREAKER_LABELS}
        isLoading={isLoading}
      />
    </ProfileSectionCard>
  );
}

function PreferenceRow({
  label,
  ids,
  labelMap,
  isLoading,
}: {
  label: string;
  ids: string[];
  labelMap: Record<string, string>;
  isLoading: boolean;
}) {
  return (
    <View style={styles.preferenceRow}>
      <View style={styles.preferenceTextWrap}>
        <Text style={styles.preferenceTitle}>{label}</Text>
        {isLoading ? (
          <Text style={styles.preferenceDescription}>Loading…</Text>
        ) : ids.length === 0 ? (
          <Text style={styles.preferenceDescription}>None selected</Text>
        ) : (
          <View style={styles.chips}>
            {ids.map((id) => (
              <View key={id} style={styles.chip}>
                <Text style={styles.chipText}>{labelMap[id] ?? id}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
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
  sectionTitle: { fontSize: 16, color: CHARCOAL, fontWeight: '700' },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    backgroundColor: CORAL,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editBtnText: { fontSize: 12, color: '#FFFFFF', fontWeight: '700' },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.45)',
    paddingTop: 16,
  },
  preferenceTextWrap: { flex: 1, minWidth: 0, gap: 8 },
  preferenceTitle: { fontSize: 14, fontWeight: '700', color: CHARCOAL },
  preferenceDescription: { fontSize: 12, lineHeight: 18, color: 'rgba(45,45,45,0.66)' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  chipText: { fontSize: 12, fontWeight: '600', color: CHARCOAL },
  enabledPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(125,155,118,0.25)',
    backgroundColor: 'rgba(125,155,118,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  enabledPillText: { fontSize: 11, color: '#7D9B76', fontWeight: '700' },
  preferenceButton: {
    borderRadius: 999,
    backgroundColor: CORAL,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  preferenceButtonText: { fontSize: 12, color: '#FFFFFF', fontWeight: '700' },
});
