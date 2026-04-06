import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_HEIGHT, CONTENT_BREATHING_ROOM } from '../styles/layout';

/**
 * Returns the correct `paddingBottom` for a scrollable screen.
 *
 * withTabBar=true  (default) — tab screens with an absolute-positioned tab bar:
 *   insets.bottom + TAB_BAR_HEIGHT + CONTENT_BREATHING_ROOM
 *
 * withTabBar=false — stack / modal screens with no tab bar:
 *   insets.bottom + CONTENT_BREATHING_ROOM
 */
export function useBottomScreenSpacing(withTabBar = true): number {
  const insets = useSafeAreaInsets();
  return withTabBar
    ? insets.bottom + TAB_BAR_HEIGHT + CONTENT_BREATHING_ROOM
    : insets.bottom + CONTENT_BREATHING_ROOM;
}
