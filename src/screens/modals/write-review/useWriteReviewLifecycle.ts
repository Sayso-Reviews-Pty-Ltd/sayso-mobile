import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { InteractionManager } from 'react-native';
import { apiFetch } from '../../../lib/api';
import { WRITING_PROMPTS } from './constants';

export function useNonCriticalReady() {
  const [nonCriticalReady, setNonCriticalReady] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => setNonCriticalReady(true));
    return () => task.cancel();
  }, []);

  return nonCriticalReady;
}

type UsePromptRotationParams = {
  reviewTextLength: number;
  textFocused: boolean;
  setPromptIndex: Dispatch<SetStateAction<number>>;
};

export function useWriteReviewPromptRotation({
  reviewTextLength,
  textFocused,
  setPromptIndex,
}: UsePromptRotationParams) {
  useEffect(() => {
    if (reviewTextLength !== 0 || textFocused) {
      return;
    }

    const interval = setInterval(() => {
      setPromptIndex((index) => (index + 1) % WRITING_PROMPTS.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [reviewTextLength, setPromptIndex, textFocused]);
}

type UseWriteReviewDealBreakerTagsParams = {
  nonCriticalReady: boolean;
  setQuickTags: Dispatch<SetStateAction<string[]>>;
};

export function useWriteReviewDealBreakerTags({
  nonCriticalReady,
  setQuickTags,
}: UseWriteReviewDealBreakerTagsParams) {
  useEffect(() => {
    if (!nonCriticalReady) {
      return;
    }

    let active = true;
    apiFetch<{ dealBreakers?: Array<{ label?: string }> }>('/api/deal-breakers')
      .then((payload) => {
        if (!active || !payload) {
          return;
        }

        const labels = (payload.dealBreakers ?? [])
          .map((item) => (item?.label ?? '').trim())
          .filter(Boolean);

        if (labels.length > 0) {
          setQuickTags([...new Set(labels)] as string[]);
        }
      })
      .catch(() => {
        // no-op
      });

    return () => {
      active = false;
    };
  }, [nonCriticalReady, setQuickTags]);
}
