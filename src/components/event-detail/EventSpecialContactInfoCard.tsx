import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { EventSpecialDetail } from '../../hooks/useEventSpecialDetail';
import { Text } from '../Typography';
import { businessDetailColors, businessDetailSpacing } from '../business-detail/styles';

type Props = {
  item: EventSpecialDetail;
};

function normalizeWebsite(url?: string | null) {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function EventSpecialContactInfoCard({ item }: Props) {
  const website = normalizeWebsite(item.bookingUrl ?? undefined);
  const phone = item.bookingContact?.trim() || undefined;
  const address = [item.location, item.city, item.country].filter(Boolean).join(', ') || null;

  const rows = [
    phone
      ? {
          key: 'phone',
          label: phone,
          icon: 'call' as keyof typeof Ionicons.glyphMap,
          iconBg: 'rgba(114,47,55,0.10)',
          iconColor: businessDetailColors.coral,
          onPress: () => Linking.openURL(`tel:${phone}`),
        }
      : null,
    website
      ? {
          key: 'website',
          label: 'Visit booking page',
          icon: 'globe' as keyof typeof Ionicons.glyphMap,
          iconBg: 'rgba(125,155,118,0.15)',
          iconColor: businessDetailColors.sage,
          onPress: () => Linking.openURL(website),
        }
      : null,
    address
      ? {
          key: 'location',
          label: address,
          icon: 'location' as keyof typeof Ionicons.glyphMap,
          iconBg: 'rgba(114,47,55,0.10)',
          iconColor: businessDetailColors.coral,
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconBg: string;
    iconColor: string;
    onPress?: () => void;
  }>;

  const heading =
    item.type === 'special' && item.businessName ? item.businessName : 'Contact Information';

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>{heading}</Text>

      {rows.length === 0 ? (
        <Text style={styles.fallback}>Contact details are not available for this listing yet.</Text>
      ) : (
        rows.map((row) => {
          const Container = row.onPress ? Pressable : View;
          return (
            <Container key={row.key} style={styles.row} onPress={row.onPress}>
              <View style={[styles.iconWrap, { backgroundColor: row.iconBg }]}>
                <Ionicons name={row.icon} size={15} color={row.iconColor} />
              </View>
              <Text style={styles.rowText}>{row.label}</Text>
            </Container>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: businessDetailSpacing.cardRadius,
    backgroundColor: businessDetailColors.cardBg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },
  heading: {
    color: businessDetailColors.charcoal,
    fontSize: 19,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 36,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    color: businessDetailColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  fallback: {
    color: businessDetailColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
