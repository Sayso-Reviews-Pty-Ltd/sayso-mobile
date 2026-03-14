import { StyleSheet, View } from 'react-native';
import { PercentileChipsSection } from './PercentileChipsSection';
import { businessDetailColors, businessDetailSpacing } from './styles';
import { CARD_SHADOW_MD } from '../../styles/overlayShadow';

type Props = {
  punctuality?: number;
  costEffectiveness?: number;
  friendliness?: number;
  trustworthiness?: number;
};

export function BusinessPerformanceInsightsCard({
  punctuality,
  costEffectiveness,
  friendliness,
  trustworthiness,
}: Props) {
  return (
    <View style={styles.card}>
      <PercentileChipsSection
        punctuality={punctuality}
        costEffectiveness={costEffectiveness}
        friendliness={friendliness}
        trustworthiness={trustworthiness}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: businessDetailSpacing.cardRadius,
    borderWidth: 1,
    borderColor: businessDetailColors.borderSoft,
    backgroundColor: businessDetailColors.cardTint,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...CARD_SHADOW_MD,
  },
});
