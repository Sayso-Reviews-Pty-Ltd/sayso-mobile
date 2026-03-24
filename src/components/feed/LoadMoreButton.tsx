import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../Typography';
import { LOAD_MORE_TOKENS as T } from './loadMoreTokens';

/**
 * `centered`  — pill button centred within its parent (default)
 * `fullWidth` — stretches to fill the parent container
 */
export type LoadMoreButtonVariant = 'centered' | 'fullWidth';

type Props = {
  onPress: () => void;
  /** Disables the button and dims it. */
  disabled?: boolean;
  /**
   * Shows a spinner alongside the label.
   * Use when the load-more action is async and in-flight.
   */
  loading?: boolean;
  /** Override the default label. */
  label?: string;
  /** Layout variant — see LoadMoreButtonVariant. */
  variant?: LoadMoreButtonVariant;
};

export function LoadMoreButton({
  onPress,
  disabled = false,
  loading = false,
  label = 'Load More',
  variant = 'centered',
}: Props) {
  const isInactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        variant === 'fullWidth' && styles.fullWidth,
        isInactive && styles.inactive,
        pressed && !isInactive && styles.pressed,
      ]}
    >
      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator
            size="small"
            color={T.color.button.loadMore.spinner}
          />
          <Text style={styles.label}>{label}</Text>
        </View>
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}

const { color, size, typography, radius, spacing, opacity } = T;
const c = color.button.loadMore;
const s = size.button.loadMore;
const ty = typography.button.loadMore;
const r = radius.button.loadMore;
const sp = spacing.button.loadMore;
const op = opacity.button.loadMore;

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    marginTop:         sp.marginTop,
    paddingVertical:   s.paddingVertical,
    paddingHorizontal: s.paddingHorizontal,
    borderRadius:      r,
    borderWidth:       1,
    borderColor:       c.border,
    backgroundColor:   c.background,
    alignItems:        'center',
    justifyContent:    'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  pressed: {
    opacity:         op.pressed,
    backgroundColor: c.backgroundPressed,
  },
  inactive: {
    opacity:         op.disabled,
    backgroundColor: c.backgroundDisabled,
  },
  label: {
    fontSize:      ty.fontSize,
    fontWeight:    ty.fontWeight,
    letterSpacing: ty.letterSpacing,
    color:         c.label,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
});
