import { StyleSheet } from 'react-native';
import { GRID } from './constants';

export const listStyles = StyleSheet.create({
  // Badge items
  badgesGrid: {
    backgroundColor: '#9DAB9B',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: GRID * 2,
    gap: GRID * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.25)',
  },
  badgePng: {
    width: 36,
    height: 36,
    flexShrink: 0,
  },
  badgeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badgeInfo: {
    flex: 1,
    gap: 2,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  badgeEarned: {
    fontSize: 12,
    color: 'rgba(45,45,45,0.6)',
  },

  // Reviews
  reviewCard: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    padding: GRID * 2,
    gap: GRID,
    borderWidth: 1,
    borderColor: 'rgba(45,45,45,0.06)',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: GRID,
  },
  reviewBizInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GRID,
    flex: 1,
  },
  reviewBizImg: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  reviewBizImgFallback: {
    backgroundColor: 'rgba(45,45,45,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewBizText: {
    flex: 1,
    gap: 2,
  },
  reviewBizName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  reviewBizType: {
    fontSize: 12,
    color: 'rgba(45,45,45,0.6)',
  },
  reviewRatingWrap: {
    flexShrink: 0,
  },
  reviewText: {
    fontSize: 14,
    color: 'rgba(45,45,45,0.8)',
    lineHeight: 20,
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewDate: {
    fontSize: 12,
    color: 'rgba(45,45,45,0.5)',
  },
  reviewLikes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewLikesText: {
    fontSize: 12,
    color: 'rgba(45,45,45,0.5)',
  },

  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: GRID * 0.75,
    marginTop: 16,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(114,47,55,0.2)',
  },
  showMoreBtnPressed: {
    opacity: 0.8,
  },
  showMoreBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#722F37',
  },

  emptyReviews: {
    paddingVertical: GRID * 3,
    alignItems: 'center',
  },
  emptyReviewsText: {
    fontSize: 14,
    color: 'rgba(45,45,45,0.5)',
  },
});
