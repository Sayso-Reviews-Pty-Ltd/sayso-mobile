import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../../components/Typography';
import { CARD_GRADIENT, cardShadowStyle } from '../../../../components/business-detail/styles';
import { C } from '../constants';

type Props = {
  type: 'event' | 'special';
  displayImage: string | null;
  displayTitle: string;
  businessName: string | null;
  displayDate: string | null;
  displayVenue: string | null;
  displayValidUntil: string | null;
};

export function ReviewContextCard({
  type,
  displayImage,
  displayTitle,
  businessName,
  displayDate,
  displayVenue,
  displayValidUntil,
}: Props) {
  return (
    <LinearGradient colors={CARD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.contextCard}>
      <Text style={styles.contextHeading}>{type === 'event' ? 'About this Event' : 'About this Special'}</Text>

      {displayImage ? (
        <Image source={{ uri: displayImage }} style={styles.contextImage} resizeMode="cover" />
      ) : (
        <View style={styles.contextImageFallback}>
          <Ionicons name="image-outline" size={28} color={C.charcoal45} />
        </View>
      )}

      <Text style={styles.contextTitle} numberOfLines={2}>
        {displayTitle}
      </Text>
      {businessName ? <Text style={styles.contextSub}>by {businessName}</Text> : null}

      <View style={styles.contextMetaWrap}>
        {displayDate ? <Text style={styles.contextMetaText}>{displayDate}</Text> : null}
        {displayVenue ? <Text style={styles.contextMetaText}>{displayVenue}</Text> : null}
        {displayValidUntil ? <Text style={styles.contextMetaText}>Valid until {displayValidUntil}</Text> : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  contextCard: {
    borderRadius: 12,
    padding: 16,
    gap: 8,
    ...cardShadowStyle,
  } as object,
  contextHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: C.charcoal,
    marginBottom: 2,
  },
  contextImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
  },
  contextImageFallback: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    backgroundColor: C.charcoal10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.charcoal,
    marginTop: 4,
  },
  contextSub: {
    fontSize: 13,
    color: C.charcoal60,
  },
  contextMetaWrap: {
    gap: 4,
    marginTop: 2,
  },
  contextMetaText: {
    fontSize: 12,
    color: C.charcoal60,
    lineHeight: 18,
  },
});
