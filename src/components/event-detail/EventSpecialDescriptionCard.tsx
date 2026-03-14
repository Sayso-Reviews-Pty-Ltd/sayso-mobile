import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../Typography';
import { businessDetailColors, businessDetailSpacing } from '../business-detail/styles';

type Props = {
  description?: string | null;
  title?: string;
};

const FALLBACK_DESCRIPTION =
  'Join us for an amazing experience. This listing is gathering momentum and full details will appear as organisers and community updates roll in.';

export function EventSpecialDescriptionCard({ description, title = 'About This Listing' }: Props) {
  const [expanded, setExpanded] = useState(false);

  const normalizedDescription = useMemo(() => {
    const trimmed = description?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : FALLBACK_DESCRIPTION;
  }, [description]);

  const isCollapsible = normalizedDescription.length > 220;

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>{title}</Text>

      <View style={styles.textContainer}>
        <Text style={styles.body} numberOfLines={!expanded && isCollapsible ? 5 : undefined}>
          {normalizedDescription}
        </Text>
      </View>

      {isCollapsible ? (
        <Pressable onPress={() => setExpanded((current) => !current)} style={styles.toggleButton}>
          <Text style={styles.toggleText}>{expanded ? 'Read less' : 'Read more'}</Text>
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
    gap: 8,
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
  textContainer: {},
  body: {
    color: businessDetailColors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  toggleButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  toggleText: {
    color: businessDetailColors.coral,
    fontSize: 13,
    fontWeight: '600',
  },
});
