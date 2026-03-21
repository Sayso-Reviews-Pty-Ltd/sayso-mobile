import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { SkeletonBlock } from '../../../components/SkeletonBlock';
import { chunkIntoRows } from './savedScreenTokens';
import { styles } from './savedScreenStyles';

function SavedCardSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <SkeletonBlock style={styles.skeletonCardMedia} variant="strong" />
      <View style={styles.skeletonCardBody}>
        <SkeletonBlock style={styles.skeletonCardTitle} />
        <SkeletonBlock style={styles.skeletonCardSubtitle} />
        <SkeletonBlock style={styles.skeletonCardReview} />
        <SkeletonBlock style={styles.skeletonCardPillRow} variant="soft" />
      </View>
    </View>
  );
}

type SavedPageSkeletonProps = {
  showHeader?: boolean;
  columnCount: number;
  gridGap: number;
};

export function SavedPageSkeleton({ showHeader = true, columnCount, gridGap }: SavedPageSkeletonProps) {
  const skeletonItems = useMemo(() => Array.from({ length: 8 }, (_, i) => i), []);
  const skeletonRows = useMemo(() => chunkIntoRows(skeletonItems, columnCount), [columnCount, skeletonItems]);

  return (
    <View style={styles.maxContainer}>
      {showHeader ? (
        <View style={styles.skeletonHeaderWrap}>
          <SkeletonBlock style={styles.skeletonHeadingBar} />
          <SkeletonBlock style={styles.skeletonSubtitleBar} />
        </View>
      ) : null}

      <View style={styles.skeletonPillWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.skeletonPillRow}>
          <SkeletonBlock style={styles.skeletonPillSmall} />
          <SkeletonBlock style={styles.skeletonPillMedium} />
          <SkeletonBlock style={styles.skeletonPillLarge} />
          <SkeletonBlock style={styles.skeletonPillMedium} />
        </ScrollView>
      </View>

      <View style={[styles.gridWrap, { rowGap: gridGap }]}>
        {skeletonRows.map((row, rowIndex) => (
          <View key={`skeleton-row-${rowIndex}`} style={[styles.gridRow, { columnGap: gridGap }]}>
            {row.map((item) => (
              <View key={`skeleton-cell-${item}`} style={styles.gridCell}>
                <SavedCardSkeleton />
              </View>
            ))}
            {row.length < columnCount
              ? Array.from({ length: columnCount - row.length }, (_, i) => (
                  <View key={`skeleton-placeholder-${rowIndex}-${i}`} style={styles.gridCell} />
                ))
              : null}
          </View>
        ))}
      </View>
    </View>
  );
}
