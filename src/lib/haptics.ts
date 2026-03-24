// ─── Haptics Grammar ─────────────────────────────────────────────────────────
// Centralised haptic feedback utility. Call these instead of using
// expo-haptics directly so the interaction grammar stays consistent
// across all screens and is easy to ramp up or disable globally.
//
// Usage:
//   import { haptics } from '../lib/haptics';
//   haptics.navigation(); // navigation transition intent
//   haptics.confirm();    // save, vote, follow
//   haptics.complete();   // completion/success moment
//   haptics.error();      // failed action (double-tap pattern)

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

function supported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

function run(fn: () => Promise<void>): void {
  if (!supported()) return;
  fn().catch(() => {});
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const haptics = {
  /** Light — navigation transitions and lightweight intent actions */
  navigation: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),

  /** Medium confirmation — save, helpful vote, toggle */
  confirm: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),

  /** Completion/success moment — medium by design (intent-forward, non-noisy) */
  complete: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),

  /** Error — failed action with explicit double-tap pattern */
  error: () => run(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await wait(70);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }),

  /** Legacy aliases kept for rollout compatibility */
  tap: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  success: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  milestone: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  selection: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
};
