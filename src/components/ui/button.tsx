import * as React from 'react';
import {
  Pressable,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import * as Slot from '@rn-primitives/slot';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../Typography';
import { CARD_BG_COLOR, CARD_BG_RGB, NAVBAR_BG_COLOR } from '../../styles/colors';

const GRID = 8;

export type OnboardingButtonVariant =
  | 'onboarding-primary'
  | 'onboarding-gradient'
  | 'onboarding-solid';

export type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  variant?: OnboardingButtonVariant;
  /** When true, merges props onto a single child Pressable (RNR / Slot pattern). */
  asChild?: boolean;
  style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
};

function mergePressableStyle(
  base: ViewStyle,
  style: ButtonProps['style'],
  state: PressableStateCallbackType,
): StyleProp<ViewStyle> {
  const extra = typeof style === 'function' ? style(state) : style;
  return [base, extra];
}

export const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  function Button(
    {
      variant = 'onboarding-primary',
      asChild = false,
      children,
      disabled,
      style,
      textStyle,
      ...pressableProps
    },
    ref,
  ) {
    const label =
      typeof children === 'string' || typeof children === 'number' ? String(children) : null;

    if (asChild) {
      return (
        <Slot.Pressable ref={ref} disabled={disabled} {...pressableProps} style={style}>
          {children}
        </Slot.Pressable>
      );
    }

    if (variant === 'onboarding-gradient') {
      return (
        <Pressable
          ref={ref}
          disabled={disabled}
          {...pressableProps}
          style={(state) =>
            mergePressableStyle(
              {
                width: '100%',
                borderRadius: 999,
                overflow: 'hidden',
                opacity: state.pressed ? 0.9 : 1,
                ...(state.pressed && { transform: [{ scale: 0.98 }] }),
              },
              style,
              state,
            )
          }
        >
          <LinearGradient
            colors={[CARD_BG_COLOR, `rgba(${CARD_BG_RGB}, 0.82)`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientInner}
          >
            {label != null ? (
              <Text style={[styles.gradientLabel, textStyle]}>{label}</Text>
            ) : (
              children
            )}
          </LinearGradient>
        </Pressable>
      );
    }

    if (variant === 'onboarding-solid') {
      return (
        <Pressable
          ref={ref}
          disabled={disabled}
          {...pressableProps}
          style={(state) =>
            mergePressableStyle(
              {
                width: '100%',
                borderRadius: 999,
                minHeight: GRID * 7,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
                opacity: disabled ? 0.55 : state.pressed ? 0.88 : 1,
              },
              style,
              state,
            )
          }
        >
          {label != null ? <Text style={[styles.solidLabel, textStyle]}>{label}</Text> : children}
        </Pressable>
      );
    }

    return (
      <Pressable
        ref={ref}
        disabled={disabled}
        {...pressableProps}
        style={(state) =>
          mergePressableStyle(
            {
              width: '100%',
              borderRadius: 999,
              backgroundColor: NAVBAR_BG_COLOR,
              paddingVertical: GRID * 2,
              paddingHorizontal: GRID * 3,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: disabled ? 0.55 : state.pressed ? 0.96 : 1,
              ...(state.pressed && { transform: [{ scale: 0.99 }] }),
            },
            style,
            state,
          )
        }
      >
        {label != null ? <Text style={[styles.primaryLabel, textStyle]}>{label}</Text> : children}
      </Pressable>
    );
  },
);

const styles = {
  primaryLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  gradientInner: {
    paddingVertical: GRID * 2,
    paddingHorizontal: GRID * 3,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  gradientLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  solidLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
};
