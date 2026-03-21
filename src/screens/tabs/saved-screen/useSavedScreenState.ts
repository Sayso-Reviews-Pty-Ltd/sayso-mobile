import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSavedBusinesses } from '../../../hooks/useSavedBusinesses';
import { useGlobalScrollToTop } from '../../../hooks/useGlobalScrollToTop';
import {
  ITEMS_PER_PAGE,
  type FilterOption,
  type SavedBusinessRecord,
} from './savedScreenTokens';
import {
  buildSavedCategories,
  buildSavedFilterOptions,
  chunkIntoRows,
  filterSavedBusinesses,
  getPaginatedSavedItems,
} from '../saved/helpers';

type Params = {
  width: number;
  gridColumns: number;
  scrollRef: React.RefObject<any>;
  hasUser: boolean;
};

export function useSavedScreenState({ width: _width, gridColumns, scrollRef, hasUser }: Params) {
  const pageChangeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paginationDoneTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollTopVisibleRef = useRef(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);

  const savedQuery = useSavedBusinesses();
  const savedBusinesses = (savedQuery.data?.businesses ?? []) as SavedBusinessRecord[];
  const isLoading = savedQuery.isLoading;
  const errorMessage = savedQuery.error instanceof Error ? savedQuery.error.message : null;

  const categories = useMemo(
    () => buildSavedCategories(savedBusinesses),
    [savedBusinesses]
  );

  const filteredBusinesses = useMemo(() => {
    return filterSavedBusinesses(savedBusinesses, selectedCategory);
  }, [savedBusinesses, selectedCategory]);

  const totalPages = useMemo(() => Math.ceil(filteredBusinesses.length / ITEMS_PER_PAGE), [filteredBusinesses.length]);

  const paginatedItems = useMemo(
    () => getPaginatedSavedItems(filteredBusinesses, currentPage, ITEMS_PER_PAGE),
    [currentPage, filteredBusinesses]
  );

  const paginatedRows = useMemo(() => chunkIntoRows(paginatedItems, gridColumns), [gridColumns, paginatedItems]);

  const filterOptions = useMemo<FilterOption[]>(
    () => buildSavedFilterOptions(categories, savedBusinesses),
    [categories, savedBusinesses]
  );

  const hasAnyContent = savedBusinesses.length > 0;
  const totalSavedCount = savedBusinesses.length;

  const setScrollTopVisible = useCallback((visible: boolean) => {
    if (scrollTopVisibleRef.current === visible) return;
    scrollTopVisibleRef.current = visible;
    setShowScrollTopButton(visible);
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollTopVisible(event.nativeEvent.contentOffset.y > 220);
  }, [setScrollTopVisible]);

  const handleScrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [scrollRef]);

  useGlobalScrollToTop({ visible: showScrollTopButton, enabled: hasUser && hasAnyContent, onScrollToTop: handleScrollToTop });

  const handlePageChange = useCallback((nextPage: number) => {
    if (nextPage === currentPage || nextPage < 1 || nextPage > totalPages) return;
    try { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    if (pageChangeTimeoutRef.current) clearTimeout(pageChangeTimeoutRef.current);
    if (paginationDoneTimeoutRef.current) clearTimeout(paginationDoneTimeoutRef.current);
    setIsPaginationLoading(true);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    pageChangeTimeoutRef.current = setTimeout(() => {
      setCurrentPage(nextPage);
      paginationDoneTimeoutRef.current = setTimeout(() => setIsPaginationLoading(false), 300);
    }, 150);
  }, [currentPage, scrollRef, totalPages]);

  const handleRefetch = useCallback(() => { void savedQuery.refetch(); }, [savedQuery]);

  useEffect(() => { if (!hasAnyContent) setScrollTopVisible(false); }, [hasAnyContent, setScrollTopVisible]);
  useEffect(() => { setCurrentPage(1); }, [selectedCategory]);
  useEffect(() => { if (selectedCategory && !categories.includes(selectedCategory)) setSelectedCategory(null); }, [categories, selectedCategory]);
  useEffect(() => { if (currentPage > 1 && totalPages > 0 && currentPage > totalPages) setCurrentPage(totalPages); }, [currentPage, totalPages]);
  useEffect(() => () => {
    if (pageChangeTimeoutRef.current) clearTimeout(pageChangeTimeoutRef.current);
    if (paginationDoneTimeoutRef.current) clearTimeout(paginationDoneTimeoutRef.current);
  }, []);

  return {
    savedQuery, isLoading, errorMessage,
    categories, filteredBusinesses, totalPages, paginatedRows, filterOptions,
    hasAnyContent, totalSavedCount,
    currentPage, isPaginationLoading, selectedCategory, setSelectedCategory,
    handleScroll, handlePageChange, handleRefetch,
  };
}
