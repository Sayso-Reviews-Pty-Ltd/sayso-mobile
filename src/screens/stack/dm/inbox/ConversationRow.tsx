import { Image, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../components/Typography';
import { C } from './constants';
import { formatTimestamp } from './formatTimestamp';
import { styles } from './styles';
import type { ConversationDto } from './types';

export function ConversationRow({ item, onPress }: { item: ConversationDto; onPress: () => void }) {
  const hasUnread = item.unread_count > 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.convRow, pressed ? styles.convRowPressed : null]}
      onPress={onPress}
    >
      <View style={styles.convAvatarWrap}>
        {item.other_user_avatar ? (
          <Image source={{ uri: item.other_user_avatar }} style={styles.convAvatar} />
        ) : (
          <View style={[styles.convAvatar, styles.convAvatarFallback]}>
            <Text style={styles.convAvatarInitial}>
              {item.other_user_name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {hasUnread ? <View style={styles.unreadDot} /> : null}
      </View>

      <View style={styles.convContent}>
        <View style={styles.convTopRow}>
          <Text style={[styles.convName, hasUnread ? styles.convNameUnread : null]} numberOfLines={1}>
            {item.other_user_name}
          </Text>
          <Text style={styles.convTime}>{formatTimestamp(item.last_message_at)}</Text>
        </View>
        {item.business_name ? (
          <View style={styles.convBizTag}>
            <Ionicons name="storefront-outline" size={11} color={C.charcoal50} />
            <Text style={styles.convBizName} numberOfLines={1}>{item.business_name}</Text>
          </View>
        ) : null}
        <Text
          style={[styles.convPreview, hasUnread ? styles.convPreviewUnread : null]}
          numberOfLines={1}
        >
          {item.last_message ?? 'No messages yet'}
        </Text>
      </View>

      {hasUnread ? (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>
            {item.unread_count > 99 ? '99+' : String(item.unread_count)}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
