import { useCallback } from 'react';
import { type Href, useNavigation, useRouter } from 'expo-router';

export function useBackOrFallback() {
  const navigation = useNavigation();
  const router = useRouter();

  return useCallback(
    (fallback: string, replace = false) => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return;
      }

      if (replace) {
        router.replace(fallback as Href);
        return;
      }

      router.push(fallback as Href);
    },
    [navigation, router]
  );
}
