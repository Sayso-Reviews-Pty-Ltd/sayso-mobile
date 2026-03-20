import { Animated, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, GRID } from './constants';
import { styles } from './LoginScreen.styles';
import type { LoginScreenProps } from './types';
import { useLoginController } from './useLoginController';
import { AuthForm, AuthModeTabs, LoginBackButton, LoginHeader } from './components';

export default function LoginScreen({ defaultMode = 'login' }: LoginScreenProps) {
  const insets = useSafeAreaInsets();
  const controller = useLoginController(defaultMode);

  return (
    <View style={[styles.root, { backgroundColor: C.page }]}>
      <LoginBackButton top={insets.top + GRID * 1.5} onPress={controller.handleBack} />

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
            <LoginHeader
              isRegister={controller.isRegister}
              headerEntranceOpacity={controller.headerEntranceOpacity}
              headerEntranceY={controller.headerEntranceY}
              titleOpacity={controller.titleOpacity}
              titleTranslateY={controller.titleTranslateY}
            />

            <Animated.View
              style={[
                styles.cardWrap,
                {
                  opacity: controller.cardEntranceOpacity,
                  transform: [{ translateY: controller.cardEntranceY }],
                },
              ]}
            >
              <LinearGradient
                colors={[C.card, C.card, 'rgba(157,171,155,0.95)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <AuthModeTabs
                  authMode={controller.authMode}
                  tabAnim={controller.tabAnim}
                  tabPillWidth={controller.tabPillWidth}
                  onTabPillLayout={controller.setTabPillWidth}
                  onSwitchMode={controller.switchMode}
                />

                <AuthForm
                  isRegister={controller.isRegister}
                  error={controller.error}
                  focusedField={controller.focusedField}
                  username={controller.username}
                  usernameError={controller.usernameError}
                  usernameIsValid={controller.usernameIsValid}
                  usernameAvailable={controller.usernameAvailable}
                  usernameChecking={controller.usernameChecking}
                  usernameCheckFailed={controller.usernameCheckFailed}
                  email={controller.email}
                  emailError={controller.emailError}
                  emailIsValid={controller.emailIsValid}
                  password={controller.password}
                  passwordHasState={controller.passwordHasState}
                  pwScore={controller.pwScore}
                  passwordVisible={controller.passwordVisible}
                  passwordTouched={controller.passwordTouched}
                  consent={controller.consent}
                  isFormValid={controller.isFormValid}
                  isSubmitting={controller.isSubmitting}
                  isGoogleLoading={controller.isGoogleLoading}
                  formOpacity={controller.formOpacity}
                  formTranslateY={controller.formTranslateY}
                  primaryFocusScale={controller.primaryFocusScale}
                  passwordInputRef={controller.passwordInputRef}
                  onChangeUsername={controller.setUsername}
                  onChangeEmail={controller.setEmail}
                  onChangePassword={controller.setPassword}
                  onFocusField={controller.setFocusedField}
                  onBlurUsername={() => {
                    controller.setFocusedField(null);
                    controller.setUsernameTouched(true);
                  }}
                  onBlurEmail={() => {
                    controller.setFocusedField(null);
                    controller.setEmailTouched(true);
                  }}
                  onBlurPassword={() => {
                    controller.setFocusedField(null);
                    controller.setPasswordTouched(true);
                  }}
                  onTogglePasswordVisibility={() =>
                    controller.setPasswordVisible((visible) => !visible)
                  }
                  onToggleConsent={() => controller.setConsent((current) => !current)}
                  onSubmit={controller.handleSubmit}
                  onGoogle={controller.handleGoogle}
                  onForgotPassword={controller.handleForgotPassword}
                  onTerms={controller.handleTerms}
                  onPrivacy={controller.handlePrivacy}
                  onSwitchMode={() =>
                    controller.switchMode(controller.isRegister ? 'login' : 'register')
                  }
                />
              </LinearGradient>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
