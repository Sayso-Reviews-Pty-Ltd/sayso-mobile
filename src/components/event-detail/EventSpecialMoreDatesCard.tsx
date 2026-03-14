import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { EventSpecialOccurrence } from '../../hooks/useEventSpecialDetail';
import { Text } from '../Typography';
import { businessDetailColors, businessDetailSpacing } from '../business-detail/styles';

const COLLAPSED_LIMIT = 3;

type Props = {
  currentStartISO?: string;
  currentEndISO?: string;
  occurrences: EventSpecialOccurrence[];
  onPressDate: (occurrenceId: string) => void;
};

function parseDate(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toLabel(startISO?: string, endISO?: string) {
  const start = parseDate(startISO);
  if (!start) return null;

  const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const end = parseDate(endISO);
  if (!end) return startLabel;

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (sameDay) return startLabel;

  const endLabel = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${startLabel} - ${endLabel}`;
}

export function EventSpecialMoreDatesCard({
  currentStartISO,
  currentEndISO,
  occurrences,
  onPressDate,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const currentLabel = toLabel(currentStartISO, currentEndISO);

  const unique = occurrences.reduce<Array<{ id: string; label: string }>>((acc, row) => {
    const label = toLabel(row.startDateISO, row.endDateISO);
    if (!label) return acc;
    if (label === currentLabel) return acc;
    if (acc.some((item) => item.label === label)) return acc;
    acc.push({ id: row.id, label });
    return acc;
  }, []);

  if (unique.length === 0) {
    return null;
  }

  const visible = expanded ? unique : unique.slice(0, COLLAPSED_LIMIT);
  const hasMore = unique.length > COLLAPSED_LIMIT;

  return (
    <View style={styles.card}>
      <View style={styles.headingRow}>
        <Text style={styles.heading}>Event Schedules</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{unique.length}</Text>
        </View>
      </View>

      {visible.map((item, index) => (
        <View key={item.id} style={[styles.row, index < visible.length - 1 ? styles.rowBorder : null]}>
          <Text style={styles.dateText}>{item.label}</Text>
          <Pressable onPress={() => onPressDate(item.id)}>
            <Text style={styles.viewText}>View</Text>
          </Pressable>
        </View>
      ))}

      {hasMore ? (
        <Pressable style={styles.showAllButton} onPress={() => setExpanded((v) => !v)}>
          <Text style={styles.showAllText}>
            {expanded ? 'Show fewer schedules' : `Show all schedules`}
          </Text>
        </Pressable>
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
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heading: {
    color: businessDetailColors.charcoal,
    fontSize: 19,
    fontWeight: '600',
  },
  countBadge: {
    borderRadius: 999,
    backgroundColor: 'rgba(114,47,55,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  countText: {
    color: businessDetailColors.coral,
    fontSize: 12,
    fontWeight: '700',
  },
  row: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.40)',
  },
  dateText: {
    color: 'rgba(45,45,45,0.80)',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  viewText: {
    color: businessDetailColors.coral,
    fontSize: 14,
    fontWeight: '700',
  },
  showAllButton: {
    alignSelf: 'flex-start',
    paddingTop: 4,
  },
  showAllText: {
    color: businessDetailColors.coral,
    fontSize: 13,
    fontWeight: '600',
  },
});
