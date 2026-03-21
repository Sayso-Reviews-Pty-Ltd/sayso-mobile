import { StyleSheet } from 'react-native';
import { businessDetailColors, businessDetailSpacing } from '../../../components/business-detail/styles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: businessDetailColors.page,
  },
  topChrome: {
    backgroundColor: businessDetailColors.coral,
  },
  stickyHeader: {
    paddingHorizontal: businessDetailSpacing.pageGutter,
    paddingTop: 14,
    paddingBottom: 12,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 8,
    paddingBottom: 24,
    gap: 20,
  },
  mainColumn: {
    marginHorizontal: businessDetailSpacing.pageGutter,
    gap: 16,
  },
});
