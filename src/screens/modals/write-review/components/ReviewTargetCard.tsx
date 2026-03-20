import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../../components/Typography';
import { CARD_GRADIENT, cardShadowStyle } from '../../../../components/business-detail/styles';
import { C } from '../constants';

type Props = {
  displayTitle: string;
  businessName: string | null;
  heroImages: string[];
  displayImage: string | null;
  displayDate: string | null;
  displayVenue: string | null;
  displayValidUntil: string | null;
};

export function ReviewTargetCard({
  displayTitle,
  businessName,
  heroImages,
  displayImage,
  displayDate,
  displayVenue,
  displayValidUntil,
}: Props) {
  return (
    <LinearGradient colors={CARD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.targetCard}>
      <View style={styles.targetRow}>
        {heroImages.length === 0 && displayImage ? (
          <Image source={{ uri: displayImage }} style={styles.targetImg} />
        ) : heroImages.length === 0 ? (
          <View style={styles.targetImgFallback}>
            <Ionicons name="star-outline" size={28} color={C.charcoal30} />
          </View>
        ) : null}
        <View style={[styles.targetInfo, heroImages.length > 0 && { flex: 1 }]}>
          <Text style={styles.targetTitle} numberOfLines={2}>
            {displayTitle}
          </Text>
          {businessName ? <Text style={styles.targetByLine}>by {businessName}</Text> : null}
          <View style={styles.targetMetaRow}>
            {displayDate ? (
              <View style={styles.metaChip}>
                <Ionicons name="calendar-outline" size={12} color={C.charcoal60} />
                <Text style={styles.metaChipText}>{displayDate}</Text>
              </View>
            ) : null}
            {displayVenue ? (
              <View style={styles.metaChip}>
                <Ionicons name="location-outline" size={12} color={C.charcoal60} />
                <Text style={styles.metaChipText} numberOfLines={1}>
                  {displayVenue}
                </Text>
              </View>
            ) : null}
            {displayValidUntil ? (
              <View style={styles.metaChip}>
                <Ionicons name="time-outline" size={12} color={C.charcoal60} />
                <Text style={styles.metaChipText}>Valid until {displayValidUntil}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  targetCard: { borderRadius: 12, padding: 16, ...cardShadowStyle } as object,
  targetRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  targetImg: { width: 72, height: 72, borderRadius: 10, flexShrink: 0 },
  targetImgFallback: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: C.charcoal10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  targetInfo: { flex: 1, gap: 4 },
  targetTitle: { fontSize: 17, fontWeight: '700', color: C.charcoal, lineHeight: 22 },
  targetByLine: { fontSize: 13, fontWeight: '500', color: C.charcoal60 },
  targetMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaChipText: { fontSize: 12, fontWeight: '500', color: C.charcoal60 },
});
