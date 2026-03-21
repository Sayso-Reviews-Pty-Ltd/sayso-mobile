// ─── Haptics Grammar ─────────────────────────────────────────────────────────
// Centralised haptic feedback utility. Call these instead of using
// expo-haptics directly so the interaction grammar stays consistent
// across all screens and is easy to ramp up or disable globally.
//
// Usage:
//   import { haptics } from '../lib/haptics';
//   haptics.tap();        // press/navigation
//   haptics.confirm();    // save, vote, follow
//   haptics.success();    // review submitted, tier unlocked
//   haptics.milestone();  // badge earned, prestige upgrade
//   haptics.error();      // failed action

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

function supported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

function run(fn: () => Promise<void>): void {
  if (!supported()) return;
  fn().catch(() => {});
}

export const haptics = {
  /** Light tap — standard press, navigation, selection */
  tap: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),

  /** Medium confirmation — save, helpful vote, toggle */
  confirm: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),

  /** Success notification — review submitted, share, complete */
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),

  /** Milestone — badge earned, prestige tier upgrade */
  milestone: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),

  /** Error — failed action, validation error */
  error: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),

  /** Selection change — filter, tab switch */
  selection: () => run(() => Haptics.selectionAsync()),
};
