import { useCallback, useRef, useState, type RefObject } from 'react';
import {
  Alert,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView,
} from 'react-native';
import { useGlobalScrollToTop } from '../../../hooks/useGlobalScrollToTop';

type UseWriteReviewBackHandlerParams = {
  hasContent: boolean;
  onBack: () => void;
};

export function useWriteReviewBackHandler({
  hasContent,
  onBack,
}: UseWriteReviewBackHandlerParams) {
  return useCallback(() => {
    if (!hasContent) {
      onBack();
      return;
    }

    Alert.alert('Discard Review?', 'You have unsaved changes. Are you sure you want to leave?', [
      { text: 'Keep Editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: onBack },
    ]);
  }, [hasContent, onBack]);
}

export function useWriteReviewScrollTop(scrollRef: RefObject<ScrollView | null>) {
  const scrollTopVisibleRef = useRef(false);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const show = event.nativeEvent.contentOffset.y > 320;
    if (scrollTopVisibleRef.current !== show) {
      scrollTopVisibleRef.current = show;
      setShowScrollTopButton(show);
    }
  }, []);

  useGlobalScrollToTop({
    visible: showScrollTopButton,
    enabled: true,
    onScrollToTop: () => scrollRef.current?.scrollTo({ y: 0, animated: true }),
  });

  return { handleScroll, showScrollTopButton };
}
