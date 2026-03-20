import { ReactNode } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { APP_PAGE_GUTTER } from '../../../../styles/layout';
import { PROFILE_CARD_GRADIENT } from '../constants';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  noHorizontalMargin?: boolean;
};

export function ProfileSectionCard({ children, style, noHorizontalMargin = false }: Props) {
  return (
    <LinearGradient
      colors={PROFILE_CARD_GRADIENT}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        noHorizontalMargin ? styles.noHorizontalMargin : null,
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: APP_PAGE_GUTTER,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  noHorizontalMargin: {
    marginHorizontal: 0,
  },
});
