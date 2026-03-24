import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { apiFetch } from '../../../lib/api';
import { haptics } from '../../../lib/haptics';
import { routes } from '../../../navigation/routes';
import { MAX, MIN } from './constants';
import { buildHelperText, toVisibleGroups } from './helpers';
import { useSubcategoriesAnimations } from './useSubcategoriesAnimations';
import { useSubcategoriesHydration } from './useSubcategoriesHydration';

export function useSubcategoriesController() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();

  const [interestIds, setInterestIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useSubcategoriesHydration({ setInterestIds, setSelected });

  const visibleGroups = useMemo(() => toVisibleGroups(interestIds), [interestIds]);

  const { counterAnimStyle, getPillMutables, groupMutables, triggerExcite, triggerShake } =
    useSubcategoriesAnimations({
      reducedMotion,
      selected,
      visibleGroups,
    });

  const toggle = useCallback(
    (id: string) => {
      haptics.navigation();

      triggerExcite(id);

      setSelected((previous) => {
        const next = new Set(previous);
        if (next.has(id)) {
          next.delete(id);
        } else if (next.size < MAX) {
          next.add(id);
        } else {
          triggerShake(id);
        }
        return next;
      });
    },
    [triggerExcite, triggerShake]
  );

  const canContinue = selected.size >= MIN;
  const atMax = selected.size >= MAX;

  const handleContinue = useCallback(async () => {
    if (!canContinue || isLoading) {
      return;
    }

    haptics.complete();

    setIsLoading(true);
    setError('');

    try {
      const ids = Array.from(selected);
      await apiFetch('/api/onboarding/subcategories', {
        method: 'POST',
        body: JSON.stringify({ subcategories: ids }),
      });
      await AsyncStorage.setItem('onboarding_subcategories', JSON.stringify(ids));
      router.push(routes.dealBreakers() as never);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Failed to save subcategories. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [canContinue, isLoading, router, selected]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const helperText = buildHelperText(selected.size);

  return {
    atMax,
    canContinue,
    counterAnimStyle,
    error,
    getPillMutables,
    groupMutables,
    handleBack,
    handleContinue,
    helperText,
    isLoading,
    selected,
    selectedCount: selected.size,
    toggle,
    visibleGroups,
  };
}
