import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { EventSpecialDetail } from '../../hooks/useEventSpecialDetail';
import { Text } from '../Typography';
import { businessDetailSpacing } from '../business-detail/styles';

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
          onPress: () => Linking.openURL(`tel:${phone}`),
        }
      : null,
    website
      ? {
          key: 'website',
          label: 'Visit booking page',
          icon: 'globe' as keyof typeof Ionicons.glyphMap,
          onPress: () => Linking.openURL(website),
        }
      : null,
    address
      ? {
          key: 'location',
          label: address,
          icon: 'location' as keyof typeof Ionicons.glyphMap,
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
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
        rows.map((row, index) => {
          const Container = row.onPress ? Pressable : View;
          return (
            <Container
              key={row.key}
              style={[styles.row, index < rows.length - 1 ? styles.rowBorder : null]}
              onPress={row.onPress}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={row.icon} size={15} color="rgba(255,255,255,0.80)" />
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
    backgroundColor: '#722F37',
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
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 40,
    paddingVertical: 4,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  rowText: {
    flex: 1,
    color: 'rgba(255,255,255,0.80)',
    fontSize: 14,
    lineHeight: 20,
  },
  fallback: {
    color: 'rgba(255,255,255,0.60)',
    fontSize: 14,
    lineHeight: 20,
  },
});
