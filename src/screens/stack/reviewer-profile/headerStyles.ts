import { StyleSheet } from 'react-native';
import { GRID } from './constants';

export const headerStyles = StyleSheet.create({
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
    shadowOpacity: 0.1,
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
    gap: GRID * 1,
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
    paddingVertical: 4,
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
    gap: 8,
    marginTop: 4,
  },
  starRow: {
    flexDirection: 'row',
    gap: 0,
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
    shadowOpacity: 0.1,
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
    marginBottom: 4,
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
});
