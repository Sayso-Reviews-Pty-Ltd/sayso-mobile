import { useCallback, useRef, type Ref } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from '../../../components/Typography';
import { BusinessCard } from '../../../components/BusinessCard';
import { EmptyState } from '../../../components/EmptyState';
import type { BusinessListItemDto } from '@sayso/contracts';
import { haptics } from '../../../lib/haptics';
import { track } from '../../../lib/telemetry';
import { styles } from './HomeSearchResults.styles';

type Props = {
  query: string;
  results: BusinessListItemDto[];
  isLoading: boolean;
  error?: string | null;
  minRating: number | null;
  distanceKm: number | null;
  locationDenied: boolean;
  onSetMinRating: (value: number | null) => void;
  onSetDistanceKm: (value: number | null) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  listRef?: Ref<FlatList<BusinessListItemDto>>;
};

// ─── Contextual empty state ───────────────────────────────────────────────────
function SearchEmptyState({
  query,
  hasFilters,
  onClearFilters,
}: {
  query: string;
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  if (hasFilters) {
    return (
      <EmptyState
        icon="options-outline"
        title="No results match your filters"
        message="Try adjusting your distance or minimum rating."
        actionLabel="Clear filters"
        onAction={onClearFilters}
      />
    );
  }
  return (
    <EmptyState
      icon="search-outline"
      title={`No results for "${query.trim()}"`}
      message="Try a different search term or explore a nearby area."
    />
  );
}

const ratingOptions = [
  { label: '4+', value: 4 },
  { label: '4.5+', value: 4.5 },
];

const distanceOptions = [
  { label: '1 km', value: 1 },
  { label: '3 km', value: 3 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
];

function ResultSeparator() {
  return <View style={styles.separator} />;
}

function renderResultItem({ item }: { item: BusinessListItemDto }) {
  return <BusinessCard business={item} />;
}

export function HomeSearchResults({
  query,
  results,
  isLoading,
  error,
  minRating,
  distanceKm,
  locationDenied,
  onSetMinRating,
  onSetDistanceKm,
  onClearFilters,
  onRefresh,
  refreshing,
  onScroll,
  listRef,
}: Props) {
  const hasFilters = minRating != null || distanceKm != null;
  const internalRef = useRef<FlatList<BusinessListItemDto>>(null);

  // Merge the external listRef with our internal ref
  const mergedRef = useCallback(
    (node: FlatList<BusinessListItemDto> | null) => {
      (internalRef as { current: FlatList<BusinessListItemDto> | null }).current = node;
      if (typeof listRef === 'function') {
        (listRef as (node: FlatList<BusinessListItemDto> | null) => void)(node);
      } else if (listRef) {
        (listRef as React.MutableRefObject<FlatList<BusinessListItemDto> | null>).current = node;
      }
    },
    [listRef],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      onScroll?.(event);
    },
    [onScroll],
  );

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={mergedRef}
        data={isLoading ? [] : results}
        keyExtractor={(item) => item.id}
        renderItem={renderResultItem}
        ItemSeparatorComponent={ResultSeparator}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Title row — matches web flex row: title left, clear filters right */}
            <View style={styles.titleRow}>
              <View style={styles.titleColumn}>
                <Text style={styles.modeLabel}>Search Mode</Text>
                <Text style={styles.title}>Results for &ldquo;{query.trim()}&rdquo;</Text>
              </View>
              {hasFilters ? (
                <TouchableOpacity
                  onPress={onClearFilters}
                  activeOpacity={0.8}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearButtonText}>Clear filters</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Filter groups — Distance then Rating, each with label above pills */}
            <View style={styles.filters}>
              <View>
                <Text style={styles.filterLabel}>Distance</Text>
                <View style={styles.filterPills}>
                  {distanceOptions.map(({ label, value }) => (
                    <TouchableOpacity
                      key={`distance-${value}`}
                      style={[
                        styles.filterChip,
                        distanceKm === value ? styles.filterChipActive : null,
                      ]}
                      onPress={() => {
                        haptics.navigation();
                        track('discovery.filter_applied', { filter: 'distance' });
                        onSetDistanceKm(distanceKm === value ? null : value);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          distanceKm === value ? styles.filterChipTextActive : null,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text style={styles.filterLabel}>Rating</Text>
                <View style={styles.filterPills}>
                  {ratingOptions.map(({ label, value }) => (
                    <TouchableOpacity
                      key={`rating-${value}`}
                      style={[
                        styles.filterChip,
                        minRating === value ? styles.filterChipActive : null,
                      ]}
                      onPress={() => {
                        haptics.navigation();
                        track('discovery.filter_applied', { filter: 'rating' });
                        onSetMinRating(minRating === value ? null : value);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          minRating === value ? styles.filterChipTextActive : null,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {locationDenied && distanceKm != null ? (
              <Text style={styles.notice}>
                Location permission is off, so distance filtering could not be applied.
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isLoading ? null : error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <SearchEmptyState
              query={query}
              hasFilters={hasFilters}
              onClearFilters={onClearFilters}
            />
          )
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
}
