import { Animated } from 'react-native';
import { Text } from '../../../../components/Typography';
import { styles } from '../LoginScreen.styles';

type Props = {
  isRegister: boolean;
  headerEntranceOpacity: Animated.Value;
  headerEntranceY: Animated.Value;
  titleOpacity: Animated.Value;
  titleTranslateY: Animated.Value;
};

export function LoginHeader({
  isRegister,
  headerEntranceOpacity,
  headerEntranceY,
  titleOpacity,
  titleTranslateY,
}: Props) {
  return (
    <Animated.View
      style={{
        opacity: headerEntranceOpacity,
        transform: [{ translateY: headerEntranceY }],
      }}
    >
      <Animated.View
        style={[
          styles.titleBlock,
          {
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslateY }],
          },
        ]}
      >
        <Text style={styles.title}>{isRegister ? 'Create Your Account' : 'Welcome Back'}</Text>
        <Text style={styles.subtitle}>
          {isRegister
            ? 'Sign up today to share honest reviews and discover trusted businesses.'
            : 'Sign in to continue discovering sayso.'}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
