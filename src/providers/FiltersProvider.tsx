import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'user_filters';

type FiltersState = {
  minRating: number | null;
  distanceKm: number | null;
  setMinRating: (v: number | null) => void;
  setDistanceKm: (v: number | null) => void;
  clearFilters: () => void;
};

const FiltersContext = createContext<FiltersState>({
  minRating: null,
  distanceKm: null,
  setMinRating: () => {},
  setDistanceKm: () => {},
  clearFilters: () => {},
});

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const [minRating, setMinRating] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const hydratedRef = useRef(false);

  // Restore persisted filters after first render — does not block UI
  useEffect(() => {
    const restore = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: { minRating?: number | null; distanceKm?: number | null } = JSON.parse(raw);
          // Merge with defaults — only apply keys that have a real value
          if (parsed.minRating != null) setMinRating(parsed.minRating);
          if (parsed.distanceKm != null) setDistanceKm(parsed.distanceKm);
        }
      } catch { /* non-critical: runs on first mount, safe to ignore */ }
      hydratedRef.current = true;
    };
    void restore();
  }, []);

  // Persist on every filter change — guarded by hydratedRef so the initial
  // null render does not overwrite a previously saved value
  useEffect(() => {
    if (!hydratedRef.current) return;
    const save = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ minRating, distanceKm }));
      } catch { /* non-critical: filter persist failure should not surface to user */ }
    };
    void save();
  }, [minRating, distanceKm]);

  const clearFilters = useCallback(() => {
    setMinRating(null);
    setDistanceKm(null);
  }, []);

  return (
    <FiltersContext.Provider value={{ minRating, distanceKm, setMinRating, setDistanceKm, clearFilters }}>
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters() {
  return useContext(FiltersContext);
}
