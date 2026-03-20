import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

type TransitionScopeContextValue = {
  scopeTick: number;
  registerItem: () => void;
};

const TransitionScopeContext = createContext<TransitionScopeContextValue | null>(null);
const SHOULD_WARN_MISSING_TRANSITIONS = __DEV__ && process.env.EXPO_PUBLIC_DEBUG_TRANSITIONS === '1';

/**
 * Root-level scope provider — kept for legacy compatibility and as a fallback
 * for any screens that do not wrap their content in ScreenTransitionScope.
 * Animates on routeKey change (e.g. pathname).
 */
export function TransitionScopeProvider({
  routeKey,
  children,
}: {
  routeKey: string;
  children: React.ReactNode;
}) {
  const [scopeTick, setScopeTick] = useState(0);
  const itemCountRef = useRef(0);

  const registerItem = useCallback(() => {
    itemCountRef.current += 1;
  }, []);

  useEffect(() => {
    setScopeTick((current) => current + 1);
  }, [routeKey]);

  useEffect(() => {
    itemCountRef.current = 0;
    if (!SHOULD_WARN_MISSING_TRANSITIONS) return;

    const timer = setTimeout(() => {
      if (itemCountRef.current === 0) {
        console.warn(`[motion] No TransitionItem nodes detected for route "${routeKey}".`);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [routeKey, scopeTick]);

  const value = useMemo(
    () => ({
      scopeTick,
      registerItem,
    }),
    [registerItem, scopeTick]
  );

  return <TransitionScopeContext.Provider value={value}>{children}</TransitionScopeContext.Provider>;
}

/**
 * Per-screen transition scope.
 *
 * Wrap each screen's root content in this component. It uses useFocusEffect
 * so TransitionItems inside the screen replay their spring-in animation every
 * time the screen gains focus — whether arriving via forward navigation, back
 * navigation, or a tab switch.
 *
 * Why not a single root provider?
 *   A single root provider fires on pathname change, which triggers ALL mounted
 *   screens simultaneously (React Navigation keeps prior screens alive in the
 *   stack). This causes hidden screens to animate unnecessarily and creates a
 *   brief opacity flash on back-navigation as items reset before the tick fires.
 *   Per-screen isolation avoids both issues.
 *
 * Double-animation prevention:
 *   useFocusEffect fires on initial mount AND on every subsequent focus event.
 *   TransitionItems already animate on mount via their own useEffect (scopeTick=0).
 *   We skip the first useFocusEffect call so the mount animation is not
 *   cancelled and restarted a frame later.
 */
export function ScreenTransitionScope({ children }: { children: React.ReactNode }) {
  const [scopeTick, setScopeTick] = useState(0);
  const itemCountRef = useRef(0);
  // Tracks whether the initial focus event (which fires concurrently with mount)
  // has been consumed. We skip it so mount animations are not double-fired.
  const hasFocusedOnce = useRef(false);

  const registerItem = useCallback(() => {
    itemCountRef.current += 1;
  }, []);

  useFocusEffect(
    useCallback(() => {
      itemCountRef.current = 0;

      if (!hasFocusedOnce.current) {
        // First call: screen is mounting. TransitionItems animate via their
        // own mount effects (scopeTick = 0). Skip here to prevent restart.
        hasFocusedOnce.current = true;
        return;
      }

      // Subsequent calls: screen regained focus (back nav, tab switch).
      // Bumping the tick causes all TransitionItems in this screen to reset
      // and replay their spring-in.
      setScopeTick((t) => t + 1);
    }, []),
  );

  const value = useMemo(
    () => ({ scopeTick, registerItem }),
    [scopeTick, registerItem],
  );

  return (
    <TransitionScopeContext.Provider value={value}>
      {children}
    </TransitionScopeContext.Provider>
  );
}

export function usePageTransitionScope() {
  return useContext(TransitionScopeContext);
}

export function useTransitionIndex(base = 0) {
  return useCallback((offset = 0) => base + offset, [base]);
}
