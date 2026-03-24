import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/Typography';
import { useChangeEmailController } from './change-email/useChangeEmailController';
import { ChangeEmailForm } from './change-email/ChangeEmailForm';
import { ChangeEmailPendingState } from './change-email/ChangeEmailPendingState';

const GRID = 8;
const C = { page: '#E5E0E5', card: '#9DAB9B', charcoal: '#2D2D2D' };

export default function ChangeEmailScreen() {
  const insets = useSafeAreaInsets();
  const ctrl = useChangeEmailController();

  const isPending = ctrl.step === 'pending';
  const titleText = isPending ? 'Verify New Email' : 'Change Email';
  const subtitleText = isPending
    ? `A verification link was sent to ${ctrl.newEmail}.`
    : "Enter a new address. We'll send a verification link before updating your account.";

  return (
    <View style={[styles.root, { backgroundColor: C.page }]}>
      <View style={[styles.backBtnWrap, { top: insets.top + GRID * 1.5 }]}>
        <Pressable
          style={styles.backBtn}
          onPress={() => ctrl.router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back-outline" size={22} color={C.charcoal} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + GRID * 9,
              paddingBottom: insets.bottom + GRID * 4,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.rail}>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>{titleText}</Text>
              <Text style={styles.subtitle}>{subtitleText}</Text>
            </View>

            <LinearGradient
              colors={[C.card, C.card, 'rgba(157,171,155,0.95)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              {isPending ? (
                <ChangeEmailPendingState
                  newEmail={ctrl.newEmail}
                  resendCooldown={ctrl.resendCooldown}
                  isResendPending={ctrl.isResendPending}
                  error={ctrl.error}
                  onResend={ctrl.handleResend}
                  onCancel={ctrl.handleCancelPending}
                />
              ) : (
                <ChangeEmailForm
                  newEmail={ctrl.newEmail}
                  setNewEmail={ctrl.setNewEmail}
                  setTouched={ctrl.setTouched}
                  fieldError={ctrl.fieldError}
                  error={ctrl.error}
                  isValid={ctrl.isValid}
                  formDisabled={ctrl.formDisabled}
                  isPending={ctrl.isPending}
                  handleSubmit={ctrl.handleSubmit}
                />
              )}
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: GRID, alignItems: 'center' },
  rail: { width: '100%', maxWidth: 420, gap: GRID * 3 },
  backBtnWrap: { position: 'absolute', left: GRID * 2, zIndex: 20 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(45,45,45,0.08)',
  },
  titleBlock: { alignItems: 'center', gap: GRID, paddingHorizontal: GRID },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    color: C.charcoal,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(45,45,45,0.7)',
    textAlign: 'center',
    fontWeight: '400',
  },
  card: {
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: GRID,
    paddingVertical: GRID * 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
});
