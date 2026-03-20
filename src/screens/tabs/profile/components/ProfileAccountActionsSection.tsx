import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../components/Typography';
import { CHARCOAL, CORAL } from '../constants';
import { ProfileSectionCard } from './ProfileSectionCard';

type Props = {
  onSignOut: () => void;
  onChangePassword: () => void;
  onDeleteAccount: () => void;
};

export function ProfileAccountActionsSection({
  onSignOut,
  onChangePassword,
  onDeleteAccount,
}: Props) {
  return (
    <ProfileSectionCard>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeaderLeft}>
          <View style={styles.sectionIconCircle}>
            <Ionicons name="warning-outline" size={14} color="rgba(45,45,45,0.84)" />
          </View>
          <Text style={styles.sectionTitle}>Account Actions</Text>
        </View>
      </View>

      <View style={styles.accountActionsWrap}>
        <View style={styles.accountActionRow}>
          <View style={styles.accountActionInfo}>
            <Text style={styles.accountActionTitle}>Log Out</Text>
            <Text style={styles.accountActionDescription}>Sign out of your account on this device.</Text>
          </View>
          <Pressable
            style={[styles.accountActionButton, styles.accountActionButtonPrimary]}
            onPress={onSignOut}
          >
            <Text style={styles.accountActionButtonPrimaryText}>Log Out</Text>
          </Pressable>
        </View>

        <View style={[styles.accountActionRow, styles.accountActionRowBordered]}>
          <View style={styles.accountActionInfo}>
            <Text style={styles.accountActionTitle}>Change Password</Text>
            <Text style={styles.accountActionDescription}>Update your account password.</Text>
          </View>
          <Pressable
            style={[styles.accountActionButton, styles.accountActionButtonPrimary]}
            onPress={onChangePassword}
          >
            <Text style={styles.accountActionButtonPrimaryText}>Change</Text>
          </Pressable>
        </View>

        <View style={[styles.accountActionRow, styles.accountActionRowBordered]}>
          <View style={styles.accountActionInfo}>
            <Text style={styles.accountActionTitle}>Delete Account</Text>
            <Text style={styles.accountActionDescription}>
              Permanently delete your account and associated data.
            </Text>
          </View>
          <Pressable
            style={[styles.accountActionButton, styles.accountActionButtonSecondary]}
            onPress={onDeleteAccount}
          >
            <Text style={styles.accountActionButtonSecondaryText}>Delete</Text>
          </Pressable>
        </View>
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
  accountActionsWrap: {
    gap: 12,
  },
  accountActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountActionRowBordered: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.45)',
    paddingTop: 12,
  },
  accountActionInfo: {
    flex: 1,
    minWidth: 0,
  },
  accountActionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: CHARCOAL,
  },
  accountActionDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(45,45,45,0.66)',
  },
  accountActionButton: {
    minWidth: 94,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountActionButtonPrimary: {
    backgroundColor: CORAL,
  },
  accountActionButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  accountActionButtonSecondary: {
    borderWidth: 1,
    borderColor: 'rgba(114,47,55,0.25)',
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  accountActionButtonSecondaryText: {
    color: '#7F1D1D',
    fontSize: 12,
    fontWeight: '700',
  },
});
