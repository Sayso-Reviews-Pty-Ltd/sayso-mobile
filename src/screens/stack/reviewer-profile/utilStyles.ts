import { StyleSheet } from 'react-native';
import { GRID } from './constants';

export const utilStyles = StyleSheet.create({
  // Error state
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: GRID * 4,
    gap: GRID * 1.5,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D2D2D',
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    color: 'rgba(45,45,45,0.6)',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorBack: {
    marginTop: GRID,
    paddingHorizontal: GRID * 3,
    paddingVertical: GRID * 1.5,
    borderRadius: 999,
    backgroundColor: '#722F37',
  },
  errorBackText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Skeleton
  skeletonRoot: { flex: 1 },
  skeletonContent: {
    paddingHorizontal: GRID * 2,
    paddingTop: GRID * 10,
    paddingBottom: GRID * 4,
    gap: GRID * 2,
  },
  skeletonHeaderCard: {
    backgroundColor: '#9DAB9B',
    borderRadius: 12,
    padding: GRID * 2.5,
  },
  skeletonAvatarRow: {
    flexDirection: 'row',
    gap: GRID * 2,
    alignItems: 'flex-start',
  },
  skeletonAvatar: {
    width: 88,
    height: 88,
    borderRadius: 999,
  },
  skeletonHeaderText: {
    flex: 1,
    gap: GRID,
    paddingTop: GRID,
  },
  skeletonNameLine: {
    height: 20,
    borderRadius: 999,
    width: '60%',
  },
  skeletonMetaLine: {
    height: 12,
    borderRadius: 999,
    width: '80%',
  },
  skeletonMetaLine2: {
    height: 12,
    borderRadius: 999,
    width: '50%',
  },
  skeletonStatRow: {
    flexDirection: 'row',
    gap: GRID,
  },
  skeletonStatCard: {
    flex: 1,
    height: 88,
    borderRadius: 12,
  },
  skeletonReviewCard: {
    height: 120,
    borderRadius: 12,
  },
});
