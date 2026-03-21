import { useCallback, useEffect, useRef } from 'react';
import {
  Easing,
  makeMutable,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { MAX_GROUPS } from './constants';
import type { GroupMutables, PillMutables, VisibleSubcategoryGroup } from './types';

type UseSubcategoriesAnimationsParams = {
  reducedMotion: boolean;
  selected: Set<string>;
  visibleGroups: VisibleSubcategoryGroup[];
};

export function useSubcategoriesAnimations({
  reducedMotion,
  selected,
  visibleGroups,
}: UseSubcategoriesAnimationsParams) {
  const counterOpacity = useSharedValue(0);
  const counterY = useSharedValue(14);
  const prevSelectedRef = useRef<Set<string>>(new Set());
  const groupMutables = useRef<GroupMutables[]>(
    Array.from({ length: MAX_GROUPS }, () => ({
      opacity: makeMutable(0),
      y: makeMutable(20),
      titleX: makeMutable(-10),
    }))
  ).current;
  const pillMutableMap = useRef(new Map<string, PillMutables>());

  const getPillMutables = useCallback((id: string): PillMutables => {
    const existing = pillMutableMap.current.get(id);
    if (existing) {
      return existing;
    }

    const created: PillMutables = {
      opacity: makeMutable(0),
      entryScale: makeMutable(0.8),
      selectedScale: makeMutable(1),
      x: makeMutable(0),
      y: makeMutable(0),
      tapScale: makeMutable(1),
      checkScale: makeMutable(0),
    };

    pillMutableMap.current.set(id, created);
    return created;
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      counterOpacity.value = 1;
      counterY.value = 0;
      return;
    }

    const ease = Easing.bezier(0.25, 0.8, 0.25, 1);
    counterOpacity.value = withDelay(130, withTiming(1, { duration: 320, easing: ease }));
    counterY.value = withDelay(130, withTiming(0, { duration: 320, easing: ease }));
  }, [counterOpacity, counterY, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) {
      visibleGroups.forEach((_, groupIndex) => {
        const mutables = groupMutables[groupIndex];
        if (!mutables) return;
        mutables.opacity.value = 1;
        mutables.y.value = 0;
        mutables.titleX.value = 0;
      });
      return;
    }

    const ease = Easing.bezier(0.25, 0.8, 0.25, 1);
    visibleGroups.forEach((_, groupIndex) => {
      const mutables = groupMutables[groupIndex];
      if (!mutables) return;

      mutables.opacity.value = 0;
      mutables.y.value = 20;
      mutables.titleX.value = -10;

      mutables.opacity.value = withDelay(
        groupIndex * 80,
        withTiming(1, { duration: 400, easing: ease })
      );
      mutables.y.value = withDelay(
        groupIndex * 80,
        withTiming(0, { duration: 400, easing: ease })
      );
      mutables.titleX.value = withDelay(
        groupIndex * 80,
        withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) })
      );
    });
  }, [groupMutables, reducedMotion, visibleGroups]);

  useEffect(() => {
    visibleGroups.forEach((group, groupIndex) => {
      group.items.forEach((item, itemIndex) => {
        const mutables = getPillMutables(item.id);

        if (reducedMotion) {
          mutables.opacity.value = 1;
          mutables.entryScale.value = 1;
          return;
        }

        const ease = Easing.bezier(0.25, 0.8, 0.25, 1);
        mutables.opacity.value = 0;
        mutables.entryScale.value = 0.8;

        const delay = groupIndex * 80 + 50 + itemIndex * 30;
        mutables.opacity.value = withDelay(delay, withTiming(1, { duration: 300, easing: ease }));
        mutables.entryScale.value = withDelay(
          delay,
          withTiming(1, { duration: 300, easing: ease })
        );
      });
    });
  }, [getPillMutables, reducedMotion, visibleGroups]);

  useEffect(() => {
    const previous = prevSelectedRef.current;
    const visibleIds = new Set(visibleGroups.flatMap((group) => group.items.map((item) => item.id)));

    visibleIds.forEach((id) => {
      const mutables = getPillMutables(id);
      const wasSelected = previous.has(id);
      const isSelected = selected.has(id);
      if (wasSelected === isSelected) {
        return;
      }

      if (reducedMotion) {
        mutables.selectedScale.value = isSelected ? 1.05 : 1;
        mutables.checkScale.value = isSelected ? 1 : 0;
        return;
      }

      mutables.selectedScale.value = withSpring(isSelected ? 1.05 : 1, {
        stiffness: 400,
        damping: 17,
        mass: 1,
      });

      if (isSelected) {
        mutables.checkScale.value = 0;
        mutables.checkScale.value = withSpring(1, { stiffness: 500, damping: 25, mass: 1 });
      } else {
        mutables.checkScale.value = withTiming(0, {
          duration: 120,
          easing: Easing.out(Easing.ease),
        });
      }
    });

    prevSelectedRef.current = new Set(selected);
  }, [getPillMutables, reducedMotion, selected, visibleGroups]);

  const triggerShake = useCallback(
    (id: string) => {
      if (reducedMotion) {
        return;
      }

      const mutables = getPillMutables(id);
      mutables.x.value = 0;
      mutables.x.value = withSequence(
        withTiming(-4, { duration: 70, easing: Easing.inOut(Easing.ease) }),
        withTiming(4, { duration: 70, easing: Easing.inOut(Easing.ease) }),
        withTiming(-3, { duration: 70, easing: Easing.inOut(Easing.ease) }),
        withTiming(2, { duration: 70, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 70, easing: Easing.inOut(Easing.ease) })
      );
    },
    [getPillMutables, reducedMotion]
  );

  const triggerExcite = useCallback(
    (id: string) => {
      if (reducedMotion) {
        return;
      }

      const mutables = getPillMutables(id);
      mutables.tapScale.value = 1;
      mutables.y.value = 0;

      mutables.tapScale.value = withTiming(
        1.06,
        { duration: 110, easing: Easing.bezier(0.2, 0.9, 0.2, 1) },
        (finished) => {
          'worklet';
          if (finished) {
            mutables.tapScale.value = withSpring(1, { stiffness: 420, damping: 18, mass: 0.65 });
          }
        }
      );

      mutables.y.value = withTiming(
        -2,
        { duration: 110, easing: Easing.out(Easing.cubic) },
        (finished) => {
          'worklet';
          if (finished) {
            mutables.y.value = withSpring(0, { stiffness: 360, damping: 22, mass: 0.75 });
          }
        }
      );
    },
    [getPillMutables, reducedMotion]
  );

  const counterAnimStyle = useAnimatedStyle(
    () => ({
      opacity: counterOpacity.value,
      transform: [{ translateY: counterY.value }],
    }),
    [counterOpacity, counterY]
  );

  return {
    counterAnimStyle,
    getPillMutables,
    groupMutables,
    triggerExcite,
    triggerShake,
  };
}
