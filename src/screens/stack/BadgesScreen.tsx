import { useCallback, useMemo, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BADGE_MAPPINGS, BADGE_GROUPS } from '../../lib/badgeMappings';
import { Text, TextInput } from '../../components/Typography';
import { useGlobalScrollToTop } from '../../hooks/useGlobalScrollToTop';
import { useAllUserBadges } from '../../hooks/useUserBadges';
import { BadgeSection } from './badges/BadgeSection';
import { BadgeCard } from './badges/BadgeCard';
import { mapBadgeDefinition, mapApiBadgeToLibraryItem } from './badges/badgeHelpers';
import { GRID, C } from './badges/badgeScreenTypes';
import type { BadgeGroup } from '../../lib/badgeMappings';
import type { BadgeLibraryItem } from './badges/badgeScreenTypes';

export default function BadgesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: backendBadges = [] } = useAllUserBadges();

  const scrollRef = useRef<ScrollView | null>(null);
  const scrollTopVisibleRef = useRef(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const setScrollTopVisible = useCallback((v: boolean) => {
    if (scrollTopVisibleRef.current === v) return;
    scrollTopVisibleRef.current = v;
    setShowScrollTop(v);
  }, []);

  const handleScrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  useGlobalScrollToTop({ visible: showScrollTop, enabled: true, onScrollToTop: handleScrollToTop });

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollTopVisible(e.nativeEvent.contentOffset.y > 220);
  }, [setScrollTopVisible]);

  const badgeCatalog = useMemo<BadgeLibraryItem[]>(() => {
    if (backendBadges.length === 0) {
      return Object.values(BADGE_MAPPINGS).map(mapBadgeDefinition);
    }
    const deduped = new Map<string, BadgeLibraryItem>();
    backendBadges.forEach((badge) => {
      if (!badge?.id || deduped.has(badge.id)) return;
      deduped.set(badge.id, mapApiBadgeToLibraryItem(badge));
    });
    return Array.from(deduped.values());
  }, [backendBadges]);

  const badgesByGroup = useMemo(() => {
    const groups: Record<BadgeGroup, BadgeLibraryItem[]> = {
      explorer: [],
      specialist: [],
      milestone: [],
      community: [],
    };
    badgeCatalog.forEach((badge) => {
      groups[badge.badgeGroup].push(badge);
    });
    return groups;
  }, [badgeCatalog]);

  const filteredBadges = useMemo<BadgeLibraryItem[] | null>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    return badgeCatalog.filter(
      (badge) =>
        badge.name.toLowerCase().includes(q) ||
        badge.description.toLowerCase().includes(q) ||
        badge.howToEarn.toLowerCase().includes(q)
    );
  }, [searchQuery, badgeCatalog]);

  return (
    <View style={[styles.root, { backgroundColor: C.page }]}>
      <Stack.Screen options={{ title: 'Badges' }} />

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: GRID * 3, paddingBottom: GRID * 14 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Badge Library</Text>
          <Text style={styles.pageSubtitle}>
            Earn badges by exploring, reviewing, and contributing to the community.
          </Text>
        </View>

        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color={C.charcoal50} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search badges…"
            placeholderTextColor={C.charcoal50}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8} style={styles.searchClear}>
              <Ionicons name="close-circle-outline" size={18} color={C.charcoal50} />
            </Pressable>
          )}
        </View>

        {filteredBadges !== null ? (
          <View style={styles.section}>
            <Text style={styles.searchResultsLabel}>
              {filteredBadges.length} result{filteredBadges.length !== 1 ? 's' : ''} for "{searchQuery}"
            </Text>
            {filteredBadges.length === 0 ? (
              <View style={styles.emptySearch}>
                <Ionicons name="search-outline" size={32} color={C.charcoal50} />
                <Text style={styles.emptySearchText}>No badges match your search.</Text>
              </View>
            ) : (
              <View style={styles.badgeList}>
                {filteredBadges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </View>
            )}
          </View>
        ) : (
          BADGE_GROUPS.map((group) => (
            <BadgeSection
              key={group}
              groupKey={group}
              badges={badgesByGroup[group] ?? []}
            />
          ))
        )}

        {!filteredBadges && (
          <View style={styles.cta}>
            <Text style={styles.ctaTitle}>Start earning today</Text>
            <Text style={styles.ctaSubtitle}>
              Discover local businesses and leave honest reviews to unlock your first badge.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.ctaBtn, pressed ? styles.ctaBtnPressed : null]}
              onPress={() => router.push('/home' as never)}
            >
              <Text style={styles.ctaBtnText}>Explore businesses</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: GRID * 2,
    gap: GRID * 3,
  },
  pageHeader: {
    alignItems: 'center',
    gap: GRID,
    paddingHorizontal: GRID,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: C.charcoal,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 15,
    color: C.charcoal60,
    textAlign: 'center',
    lineHeight: 22,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.inputBg,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.inputBorder,
    paddingHorizontal: GRID * 2,
    minHeight: GRID * 6,
  },
  searchIcon: {
    marginRight: GRID,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: C.charcoal,
    paddingVertical: GRID * 1.5,
  },
  searchClear: {
    marginLeft: GRID,
  },
  searchResultsLabel: {
    fontSize: 13,
    color: C.charcoal50,
    marginBottom: GRID,
  },
  section: {
    gap: GRID * 1.5,
  },
  badgeList: {
    gap: GRID,
  },
  emptySearch: {
    alignItems: 'center',
    paddingVertical: GRID * 4,
    gap: GRID * 1.5,
  },
  emptySearchText: {
    fontSize: 15,
    color: C.charcoal50,
  },
  cta: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: GRID * 3,
    alignItems: 'center',
    gap: GRID * 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.charcoal,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 14,
    color: C.charcoal70,
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaBtn: {
    paddingHorizontal: GRID * 3,
    paddingVertical: GRID * 1.5,
    borderRadius: 999,
    backgroundColor: C.wine,
    marginTop: GRID * 0.5,
  },
  ctaBtnPressed: {
    opacity: 0.88,
  },
  ctaBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.white,
  },
});
