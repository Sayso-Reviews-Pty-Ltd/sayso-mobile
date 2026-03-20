import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../components/Typography';
import { CHARCOAL, CORAL } from '../constants';
import type { LocationCardStatus } from '../types';
import { ProfileSectionCard } from './ProfileSectionCard';

type Props = {
  locationStatus: LocationCardStatus;
  onRequestLocationPermission: () => void;
};

export function ProfilePreferencesSection({
  locationStatus,
  onRequestLocationPermission,
}: Props) {
  return (
    <ProfileSectionCard>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeaderLeft}>
          <View style={styles.sectionIconCircle}>
            <Ionicons name="navigate-outline" size={14} color="rgba(45,45,45,0.84)" />
          </View>
          <Text style={styles.sectionTitle}>Preferences</Text>
        </View>
      </View>

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
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.45)',
    paddingTop: 14,
  },
  preferenceTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  preferenceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: CHARCOAL,
  },
  preferenceDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(45,45,45,0.66)',
  },
  enabledPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(125,155,118,0.25)',
    backgroundColor: 'rgba(125,155,118,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  enabledPillText: {
    fontSize: 11,
    color: '#7D9B76',
    fontWeight: '700',
  },
  preferenceButton: {
    borderRadius: 999,
    backgroundColor: CORAL,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  preferenceButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
