import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { UserBadgeDto } from '../../../hooks/useUserBadges';
import { Text } from '../../../components/Typography';
import { C, GROUP_META } from './constants';
import { BadgeRow } from './BadgeRow';
import { styles } from './styles';

export function GroupSection({ groupKey, badges }: { groupKey: string; badges: UserBadgeDto[] }) {
  const meta = GROUP_META[groupKey];
  const [expanded, setExpanded] = useState(true);
  const earned = badges.filter((badge) => badge.earned);
  const total = badges.length;

  if (!meta) return null;

  return (
    <View style={styles.groupSection}>
      <Pressable
        style={styles.groupHeader}
        onPress={() => setExpanded((value) => !value)}
      >
        <View style={[styles.groupIconWrap, { backgroundColor: `${meta.color}20` }]}>
          <Ionicons name={meta.icon} size={18} color={meta.color} />
        </View>
        <View style={styles.groupHeaderText}>
          <Text style={styles.groupTitle}>{meta.label}</Text>
          <Text style={styles.groupProgress}>{earned.length}/{total} earned</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={C.white50}
        />
      </Pressable>

      {expanded ? (
        <View style={styles.groupBadges}>
          {badges.map((badge) => (
            <BadgeRow key={badge.id} badge={badge} earned={Boolean(badge.earned)} />
          ))}
        </View>
      ) : null}
    </View>
  );
}
