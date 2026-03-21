import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../components/Typography';
import { SAGE } from './savedScreenTokens';
import { getPageNumbers } from './savedScreenTokens';
import { styles } from './savedScreenStyles';

type Props = {
  currentPage: number;
  totalPages: number;
  disabled: boolean;
  onPageChange: (page: number) => void;
};

export function SavedPagination({ currentPage, totalPages, disabled, onPageChange }: Props) {
  const pageNumbers = useMemo(() => getPageNumbers(currentPage, totalPages), [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <View style={styles.paginationRow}>
      <Pressable onPress={() => onPageChange(currentPage - 1)} disabled={currentPage === 1 || disabled} style={styles.paginationNavButton}>
        {currentPage === 1 || disabled ? (
          <View style={styles.paginationNavButtonDisabled}>
            <Ionicons name="chevron-back-outline" size={20} color="rgba(45,45,45,0.3)" />
          </View>
        ) : (
          <LinearGradient colors={[SAGE, 'rgba(125,155,118,0.8)']} style={styles.paginationNavButtonEnabled} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="chevron-back-outline" size={20} color="#FFFFFF" />
          </LinearGradient>
        )}
      </Pressable>

      <View style={styles.paginationNumbersRow}>
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return <Text key={`ellipsis-${index}`} style={styles.paginationEllipsis}>...</Text>;
          }
          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;
          return (
            <Pressable key={`page-${pageNumber}`} disabled={disabled} onPress={() => onPageChange(pageNumber)} style={styles.paginationPageButton}>
              <LinearGradient
                colors={isActive ? [SAGE, 'rgba(125,155,118,0.8)'] : ['rgba(125,155,118,0.2)', 'rgba(125,155,118,0.1)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.paginationPageGradient}
              >
                <Text style={[styles.paginationPageText, isActive ? styles.paginationPageTextActive : null]}>
                  {pageNumber}
                </Text>
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>

      <Pressable onPress={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages || disabled} style={styles.paginationNavButton}>
        {currentPage === totalPages || disabled ? (
          <View style={styles.paginationNavButtonDisabled}>
            <Ionicons name="chevron-forward-outline" size={20} color="rgba(45,45,45,0.3)" />
          </View>
        ) : (
          <LinearGradient colors={[SAGE, 'rgba(125,155,118,0.8)']} style={styles.paginationNavButtonEnabled} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="chevron-forward-outline" size={20} color="#FFFFFF" />
          </LinearGradient>
        )}
      </Pressable>
    </View>
  );
}
