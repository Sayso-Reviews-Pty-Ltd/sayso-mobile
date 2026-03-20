import { Animated, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, GRID } from './constants';
import { styles } from './ResetPasswordScreen.styles';
import { useResetPasswordController } from './useResetPasswordController';
import {
  ResetPasswordBackButton,
  ResetPasswordForm,
  ResetPasswordHeader,
  ResetPasswordInvalidState,
  ResetPasswordLoadingState,
  ResetPasswordSuccessState,
} from './components';

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const controller = useResetPasswordController();

  return (
    <View style={[styles.root, { backgroundColor: C.page }]}>
      {controller.screenState !== 'checking' ? (
        <ResetPasswordBackButton top={insets.top + GRID * 1.5} onPress={controller.handleBack} />
      ) : null}

      {controller.screenState === 'checking' ? (
        <ResetPasswordLoadingState paddingTop={insets.top} />
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
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
              <ResetPasswordHeader
                screenState={controller.screenState}
                opacity={controller.headerOpacity}
                translateY={controller.headerY}
              />

              <Animated.View
                style={[
                  styles.cardWrap,
                  {
                    opacity: controller.cardOpacity,
                    transform: [{ translateY: controller.cardY }],
                  },
                ]}
              >
                <LinearGradient
                  colors={[C.card, C.card, 'rgba(157,171,155,0.95)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.card}
                >
                  {controller.screenState === 'invalid' ? (
                    <ResetPasswordInvalidState
                      onRequestNewLink={controller.handleRequestNewLink}
                      onBackToLogin={controller.handleBackToLogin}
                    />
                  ) : null}

                  {controller.screenState === 'success' ? <ResetPasswordSuccessState /> : null}

                  {controller.screenState === 'form' ? (
                    <ResetPasswordForm
                      error={controller.error}
                      password={controller.password}
                      confirmPassword={controller.confirmPassword}
                      passwordVisible={controller.passwordVisible}
                      confirmVisible={controller.confirmVisible}
                      focusedField={controller.focusedField}
                      passwordError={controller.passwordError}
                      confirmError={controller.confirmError}
                      pwScore={controller.pwScore}
                      isFormValid={controller.isFormValid}
                      isSubmitting={controller.isSubmitting}
                      primaryScale={controller.primaryScale}
                      onChangePassword={controller.setPassword}
                      onChangeConfirmPassword={controller.setConfirmPassword}
                      onFocusField={controller.setFocusedField}
                      onBlurPassword={controller.handleBlurPassword}
                      onBlurConfirmPassword={controller.handleBlurConfirm}
                      onTogglePasswordVisible={() =>
                        controller.setPasswordVisible((visible) => !visible)
                      }
                      onToggleConfirmVisible={() =>
                        controller.setConfirmVisible((visible) => !visible)
                      }
                      onSubmit={controller.handleSubmit}
                    />
                  ) : null}
                </LinearGradient>
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
