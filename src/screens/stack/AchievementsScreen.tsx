import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, ScrollView, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAllUserBadges } from '../../hooks/useUserBadges';
import { useAuthSession } from '../../hooks/useSession';
import { SkeletonBlock } from '../../components/SkeletonBlock';
import { Text } from '../../components/Typography';
import { GROUP_META, GRID, C } from './achievements/constants';
import { GroupSection } from './achievements/GroupSection';
import { ProgressRing } from './achievements/ProgressRing';
import { styles } from './achievements/styles';

export default function AchievementsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthSession();

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(GRID * 2)).current;

  const { data: allBadges = [], isLoading } = useAllUserBadges();
  const earnedCount = allBadges.filter((badge) => badge.earned).length;
  const totalCount = allBadges.length;
  const percentage = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  const groupedBadges = allBadges.reduce<Record<string, typeof allBadges>>((acc, badge) => {
    const group = badge.badge_group ?? 'explorer';
    if (!acc[group]) acc[group] = [];
    acc[group].push(badge);
    return acc;
  }, {});

  useEffect(() => {
    if (isLoading) return;
    const ease = Easing.out(Easing.cubic);
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 260, easing: ease, useNativeDriver: true }),
      Animated.timing(headerY, { toValue: 0, duration: 260, easing: ease, useNativeDriver: true }),
    ]).start();
  }, [isLoading, headerOpacity, headerY]);

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}> 
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.backBtnWrap, { top: insets.top + GRID * 1.5 }]}> 
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back-outline" size={22} color={C.white} />
        </Pressable>
      </View>

      {isLoading ? (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + GRID * 9, paddingBottom: insets.bottom + GRID * 4 },
          ]}
        >
          <View style={styles.ringPlaceholder}>
            <SkeletonBlock style={styles.skeletonRing} />
          </View>
          {[0, 1, 2, 3].map((index) => (
            <SkeletonBlock key={index} style={styles.skeletonGroup} />
          ))}
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + GRID * 8, paddingBottom: insets.bottom + GRID * 4 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.pageHeader,
              { opacity: headerOpacity, transform: [{ translateY: headerY }] },
            ]}
          >
            <Text style={styles.pageTitle}>Achievements</Text>
            <Text style={styles.pageSubtitle}>
              {earnedCount} of {totalCount} badges earned
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.ringSection,
              { opacity: headerOpacity, transform: [{ translateY: headerY }] },
            ]}
          >
            <ProgressRing percentage={percentage} />

            <View style={styles.quickStats}>
              {Object.entries(GROUP_META).map(([key, meta]) => {
                const groupBadges = groupedBadges[key] ?? [];
                const groupEarned = groupBadges.filter((badge) => badge.earned).length;
                return (
                  <View key={key} style={styles.quickStat}>
                    <Ionicons name={meta.icon} size={16} color={meta.color} />
                    <Text style={styles.quickStatValue}>{groupEarned}</Text>
                    <Text style={styles.quickStatLabel}>{meta.label}</Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>

          {!user ? (
            <View style={styles.unauthState}>
              <Ionicons name="lock-closed-outline" size={40} color={C.white50} />
              <Text style={styles.unauthTitle}>Sign in to track your achievements</Text>
              <Pressable
                style={styles.signInBtn}
                onPress={() => router.push('/login' as never)}
              >
                <Text style={styles.signInBtnText}>Sign in</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.groups}>
              {Object.keys(GROUP_META).map((key) => (
                <GroupSection
                  key={key}
                  groupKey={key}
                  badges={groupedBadges[key] ?? []}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
