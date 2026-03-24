import { Pressable, ScrollView, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAllUserBadges } from '../../hooks/useUserBadges';
import { useAuthSession } from '../../hooks/useSession';
import { LoadingCrossfade } from '../../components/LoadingCrossfade';
import { SkeletonBlock } from '../../components/SkeletonBlock';
import { Text } from '../../components/Typography';
import { TransitionItem } from '../../components/motion/TransitionItem';
import { ScreenTransitionScope } from '../../components/motion/TransitionScope';
import { GROUP_META, GRID, C } from './achievements/constants';
import { GroupSection } from './achievements/GroupSection';
import { ProgressRing } from './achievements/ProgressRing';
import { styles } from './achievements/styles';

export default function AchievementsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthSession();

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

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}> 
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.backBtnWrap, { top: insets.top + GRID * 1.5 }]}> 
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back-outline" size={22} color={C.white} />
        </Pressable>
      </View>

      <ScreenTransitionScope>
        <LoadingCrossfade
          loading={isLoading}
          skeleton={
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
          }
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingTop: insets.top + GRID * 8, paddingBottom: insets.bottom + GRID * 4 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <TransitionItem role="hero" index={0}>
              <View style={styles.pageHeader}>
                <Text style={styles.pageTitle}>Achievements</Text>
                <Text style={styles.pageSubtitle}>
                  {earnedCount} of {totalCount} badges earned
                </Text>
              </View>
            </TransitionItem>

            <TransitionItem role="subheading" index={1}>
              <View style={styles.ringSection}>
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
              </View>
            </TransitionItem>

            {!user ? (
              <TransitionItem role="support" index={2}>
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
              </TransitionItem>
            ) : (
              <View style={styles.groups}>
                {Object.keys(GROUP_META).map((key, index) => (
                  <TransitionItem key={key} role="listItem" index={index + 2} animate={index < 10}>
                    <GroupSection
                      groupKey={key}
                      badges={groupedBadges[key] ?? []}
                    />
                  </TransitionItem>
                ))}
              </View>
            )}
          </ScrollView>
        </LoadingCrossfade>
      </ScreenTransitionScope>
    </View>
  );
}
