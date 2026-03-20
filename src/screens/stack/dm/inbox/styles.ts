import { StyleSheet } from 'react-native';
import { C, GRID } from './constants';

export const styles = StyleSheet.create({
  root: { flex: 1 },

  searchWrap: {
    paddingHorizontal: GRID * 2,
    paddingBottom: GRID * 1.5,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GRID,
    backgroundColor: C.inputBg,
    borderRadius: 999,
    paddingHorizontal: GRID * 2,
    minHeight: GRID * 5.5,
    borderWidth: 1,
    borderColor: 'rgba(45,45,45,0.12)',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: C.charcoal,
  },

  listContent: {
    paddingHorizontal: GRID * 2,
  },
  separator: {
    height: 1,
    backgroundColor: C.charcoal08,
    marginLeft: GRID * 2 + 52,
  },

  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: GRID * 1.5,
    gap: GRID * 1.5,
  },
  convRowPressed: {
    opacity: 0.7,
  },
  convAvatarWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  convAvatar: {
    width: 52,
    height: 52,
    borderRadius: 999,
  },
  convAvatarFallback: {
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  convAvatarInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: C.white,
  },
  unreadDot: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: C.wine,
    borderWidth: 2,
    borderColor: C.page,
  },
  convContent: {
    flex: 1,
    gap: 3,
  },
  convTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: GRID,
  },
  convName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: C.charcoal,
  },
  convNameUnread: {
    fontWeight: '700',
  },
  convTime: {
    fontSize: 12,
    color: C.charcoal50,
    flexShrink: 0,
  },
  convBizTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  convBizName: {
    fontSize: 12,
    color: C.charcoal50,
  },
  convPreview: {
    fontSize: 14,
    color: C.charcoal60,
    lineHeight: 19,
  },
  convPreviewUnread: {
    color: C.charcoal,
    fontWeight: '500',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: C.wine,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    flexShrink: 0,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.white,
  },

  unauthState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: GRID * 4,
    gap: GRID * 2,
  },
  unauthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.charcoal,
    textAlign: 'center',
  },
  unauthSubtitle: {
    fontSize: 14,
    color: C.charcoal60,
    textAlign: 'center',
    lineHeight: 20,
  },
  signInBtn: {
    paddingHorizontal: GRID * 3,
    paddingVertical: GRID * 1.5,
    borderRadius: 999,
    backgroundColor: C.wine,
  },
  signInBtnPressed: { opacity: 0.88 },
  signInBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.white,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: GRID * 4,
    gap: GRID * 1.5,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: C.charcoal,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: C.charcoal60,
    textAlign: 'center',
    lineHeight: 20,
  },

  skeletonList: {
    paddingHorizontal: GRID * 2,
    gap: GRID,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: GRID * 1.5,
    gap: GRID * 1.5,
  },
  skeletonAvatar: {
    width: 52,
    height: 52,
    borderRadius: 999,
    flexShrink: 0,
  },
  skeletonContent: {
    flex: 1,
    gap: GRID,
  },
  skeletonName: {
    height: 14,
    borderRadius: 999,
    width: '50%',
  },
  skeletonPreview: {
    height: 12,
    borderRadius: 999,
    width: '80%',
  },
});
