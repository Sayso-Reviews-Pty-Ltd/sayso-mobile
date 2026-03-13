import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { EventSpecialDetail } from '../../hooks/useEventSpecialDetail';
import { Text } from '../Typography';
import { businessDetailColors, businessDetailSpacing } from '../business-detail/styles';

type Props = {
  item: EventSpecialDetail;
};

function formatVenueLocation(item: EventSpecialDetail) {
  const line = [item.venueName, item.city, item.country].filter(Boolean).join(' - ');
  return line || item.location || 'Location to be announced';
}

export function EventSpecialDetailsCard({ item }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>{item.type === 'special' ? 'Special Details' : 'Event Details'}</Text>

      {item.type === 'special' ? (
        <>
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <Ionicons name="calendar" size={15} color={businessDetailColors.charcoal} />
            </View>
            <View style={styles.copyWrap}>
              <Text style={styles.label}>Valid from</Text>
              <Text style={styles.value}>{item.startDate || 'Date TBA'}</Text>
            </View>
          </View>

          {item.endDate ? (
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <Ionicons name="calendar-outline" size={15} color={businessDetailColors.charcoal} />
              </View>
              <View style={styles.copyWrap}>
                <Text style={styles.label}>Valid until</Text>
                <Text style={styles.value}>{item.endDate}</Text>
              </View>
            </View>
          ) : null}
        </>
      ) : (
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <Ionicons name="calendar" size={15} color={businessDetailColors.charcoal} />
          </View>
          <View style={styles.copyWrap}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{item.startDate || 'Date TBA'}</Text>
            {item.endDate ? <Text style={styles.subValue}>to {item.endDate}</Text> : null}
          </View>
        </View>
      )}

      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name="location" size={15} color={businessDetailColors.charcoal} />
        </View>
        <View style={styles.copyWrap}>
          <Text style={styles.label}>Venue</Text>
          <Text style={styles.value}>{formatVenueLocation(item)}</Text>
        </View>
      </View>

      {item.price ? (
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <Text style={styles.rIcon}>R</Text>
          </View>
          <View style={styles.copyWrap}>
            <Text style={styles.label}>Price</Text>
            <Text style={styles.value}>{item.price}</Text>
          </View>
        </View>
      ) : null}

      {item.type === 'special' && item.businessName ? (
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <Ionicons name="storefront" size={15} color={businessDetailColors.charcoal} />
          </View>
          <View style={styles.copyWrap}>
            <Text style={styles.label}>Offered by</Text>
            <Text style={styles.value}>{item.businessName}</Text>
          </View>
        </View>
      ) : null}

      {item.occurrencesCount && item.occurrencesCount > 1 ? (
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <Ionicons name="repeat" size={15} color={businessDetailColors.charcoal} />
          </View>
          <View style={styles.copyWrap}>
            <Text style={styles.label}>Occurrences</Text>
            <Text style={styles.value}>{item.occurrencesCount} dates</Text>
          </View>
        </View>
      ) : null}
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
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(229,224,229,0.74)',
    marginTop: 2,
  },
  copyWrap: {
    flex: 1,
  },
  label: {
    color: businessDetailColors.textSubtle,
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    color: businessDetailColors.charcoal,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 1,
  },
  subValue: {
    color: businessDetailColors.textMuted,
    fontSize: 13,
    marginTop: 1,
  },
  rIcon: {
    color: businessDetailColors.charcoal,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
});
