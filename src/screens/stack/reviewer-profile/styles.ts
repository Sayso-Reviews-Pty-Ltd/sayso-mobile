import { StyleSheet } from 'react-native';
import { GRID } from './constants';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  backBtnWrap: {
    position: 'absolute',
    left: GRID * 2,
    zIndex: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(45,45,45,0.08)',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: GRID * 2,
    gap: GRID * 2,
  },

  // Header card
  headerCard: {
    backgroundColor: '#9DAB9B',
    borderRadius: 12,
    padding: GRID * 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },
  profileRow: {
    flexDirection: 'row',
    gap: GRID * 2,
    alignItems: 'flex-start',
  },
  avatarWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarFallback: {
    backgroundColor: 'rgba(45,45,45,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeDotVerified: {
    backgroundColor: '#3B82F6',
    bottom: 0,
    right: 0,
  },
  badgeDotTop: {
    backgroundColor: '#F59E0B',
    top: 0,
    right: 0,
  },
  profileInfo: {
    flex: 1,
    gap: GRID * 0.75,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: GRID,
  },
  reviewerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D2D2D',
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  trophyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  trophyBadge_gold: { backgroundColor: '#FEF3C7' },
  trophyBadge_silver: { backgroundColor: '#F3F4F6' },
  trophyBadge_bronze: { backgroundColor: '#FEF0E7' },
  'trophyBadge_rising-star': { backgroundColor: '#EDE9FE' },
  'trophyBadge_community-favorite': { backgroundColor: '#FCE7F3' },
  trophyBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2D2D2D',
    textTransform: 'capitalize',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: 'rgba(45,45,45,0.7)',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  starRow: {
    flexDirection: 'row',
    gap: 1,
  },
  ratingValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  reviewCountText: {
    fontSize: 13,
    color: 'rgba(45,45,45,0.6)',
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    gap: GRID,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#9DAB9B',
    borderRadius: 12,
    padding: GRID * 1.5,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(45,45,45,0.7)',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D2D2D',
    letterSpacing: -0.3,
  },

  // Sections
  section: {
    gap: GRID * 1.5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D2D2D',
    letterSpacing: -0.2,
  },

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
