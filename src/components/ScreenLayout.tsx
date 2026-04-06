import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import type { StyleProp, ViewStyle } from 'react-native';

interface ScreenLayoutProps {
  children: ReactNode;
  /**
   * Which edges the SafeAreaView should inset.
   *
   * Defaults to ['left', 'right'] — top is intentionally excluded because
   * navigation headers (StackPageHeader, Tabs header) already handle insets.top.
   * Bottom is excluded because scroll content applies the correct paddingBottom
   * via useBottomScreenSpacing().
   *
   * Override to ['top', 'left', 'right'] for screens that have no navigation
   * header and must handle the status-bar / notch area themselves.
   */
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
}

/**
 * Standard screen root wrapper.
 *
 * Replaces bare `<SafeAreaView>` usages across tab and stack screens.
 * Pair with `useBottomScreenSpacing(withTabBar)` on the ScrollView /
 * FlatList contentContainerStyle to get correct bottom padding.
 *
 * @example
 * // Tab screen (no navigation header — needs top edge)
 * <ScreenLayout edges={['top', 'left', 'right']} style={styles.container}>
 *   <ScrollView contentContainerStyle={{ paddingBottom: bottomSpacing }}>
 *     ...
 *   </ScrollView>
 * </ScreenLayout>
 *
 * @example
 * // Tab screen with StackPageHeader (header handles top inset)
 * <ScreenLayout style={styles.container}>
 *   <StackPageHeader ... />
 *   <ScrollView contentContainerStyle={{ paddingBottom: bottomSpacing }}>
 *     ...
 *   </ScrollView>
 * </ScreenLayout>
 */
export function ScreenLayout({ children, edges, style }: ScreenLayoutProps) {
  return (
    <SafeAreaView edges={edges ?? ['left', 'right']} style={[styles.root, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
