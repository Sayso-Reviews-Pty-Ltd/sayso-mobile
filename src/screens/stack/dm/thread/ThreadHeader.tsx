import { Image, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../components/Typography';
import { C, GRID } from './constants';
import { styles } from './styles';

type Props = {
  businessName?: string | null;
  otherAvatar?: string | null;
  otherName: string;
  onBack: () => void;
  topInset: number;
};

export function ThreadHeader({ businessName, otherAvatar, otherName, onBack, topInset }: Props) {
  return (
    <View style={[styles.header, { paddingTop: topInset + GRID * 1.5 }]}>
      <Pressable style={styles.backBtn} onPress={onBack} hitSlop={12}>
        <Ionicons name="chevron-back-outline" size={22} color={C.charcoal} />
      </Pressable>
      <View style={styles.headerInfo}>
        <Text style={styles.headerName} numberOfLines={1}>{otherName}</Text>
        {businessName ? (
          <View style={styles.headerBiz}>
            <Ionicons name="storefront-outline" size={11} color={C.charcoal50} />
            <Text style={styles.headerBizText} numberOfLines={1}>{businessName}</Text>
          </View>
        ) : null}
      </View>
      {otherAvatar ? (
        <Image source={{ uri: otherAvatar }} style={styles.headerAvatar} />
      ) : (
        <View style={[styles.headerAvatar, styles.headerAvatarFallback]}>
          <Ionicons name="person-outline" size={16} color={C.charcoal50} />
        </View>
      )}
    </View>
  );
}
