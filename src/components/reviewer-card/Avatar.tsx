import { useState } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../Typography';
import { avatarStyles } from './styles';
import { C } from './theme';
import type { BadgeType } from './types';

type Props = {
  src?: string;
  name: string;
  size: number;
  badge?: BadgeType;
  isTopCard: boolean;
};

export function Avatar({ src, name, size, badge, isTopCard }: Props) {
  const [imgError, setImgError] = useState(false);
  const initial = (name || 'U')[0].toUpperCase();

  return (
    <View style={{ position: 'relative' }}>
      {src && !imgError ? (
        <Image
          source={{ uri: src }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 2,
            borderColor: isTopCard ? C.amber400 : C.white,
          }}
          onError={() => setImgError(true)}
          contentFit="cover"
        />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isTopCard ? 'rgba(69,26,3,0.60)' : 'rgba(125,155,118,0.25)',
            borderWidth: 2,
            borderColor: isTopCard ? 'rgba(251,191,36,0.30)' : C.white,
          }}
        >
          {size >= 40 ? (
            <Ionicons
              name="person-outline"
              size={size * 0.42}
              color={isTopCard ? 'rgba(251,211,77,0.5)' : C.charcoal40}
            />
          ) : (
            <Text style={{ fontSize: size * 0.42, fontWeight: '700', color: isTopCard ? C.amber300 : C.sage }}>
              {initial}
            </Text>
          )}
        </View>
      )}

      {badge === 'verified' && (
        <View style={avatarStyles.badgeOverlay}>
          <View style={avatarStyles.verifiedDot}>
            <Ionicons name="checkmark-outline" size={8} color={C.white} />
          </View>
        </View>
      )}
      {badge === 'top' && (
        <View style={avatarStyles.badgeOverlay}>
          <View style={[avatarStyles.topDot, { backgroundColor: C.amber400 }]}>
            <Ionicons name="star-outline" size={8} color={C.white} />
          </View>
        </View>
      )}
    </View>
  );
}
