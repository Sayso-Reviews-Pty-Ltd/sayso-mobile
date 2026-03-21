import { StyleSheet } from 'react-native';
import { C, GRID } from './constants';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: GRID * 2,
    paddingBottom: GRID * 1.5,
    gap: GRID,
    borderBottomWidth: 1,
    borderBottomColor: C.charcoal08,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.charcoal08,
    flexShrink: 0,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: C.charcoal,
    letterSpacing: -0.2,
  },
  headerBiz: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  headerBizText: {
    fontSize: 12,
    color: C.charcoal50,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 999,
    flexShrink: 0,
  },
  headerAvatarFallback: {
    backgroundColor: C.charcoal12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  messageList: {
    paddingHorizontal: GRID * 2,
    paddingTop: GRID * 2,
    gap: 2,
  },

  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 1,
  },
  bubbleRowMine: {
    justifyContent: 'flex-end',
  },
  bubbleRowTheirs: {
    justifyContent: 'flex-start',
  },
  bubbleAvatarSlot: {
    width: 28,
    marginRight: GRID,
  },
  bubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 999,
  },
  bubbleAvatarFallback: {
    backgroundColor: C.charcoal12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleWrap: {
    maxWidth: '75%',
    gap: 3,
  },
  bubbleWrapMine: {
    alignItems: 'flex-end',
  },
  bubbleWrapTheirs: {
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: GRID * 1.75,
    paddingVertical: GRID * 1.25,
  },
  bubbleMine: {
    backgroundColor: C.myBubble,
    borderRadius: 20,
  },
  bubbleTheirs: {
    backgroundColor: C.theirBubble,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.charcoal08,
  },
  bubbleMineLastInGroup: {
    borderBottomRightRadius: 6,
  },
  bubbleMineMiddle: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  bubbleTheirsLastInGroup: {
    borderBottomLeftRadius: 6,
  },
  bubbleTheirsMiddle: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  bubbleFailed: {
    opacity: 0.6,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  bubbleTextMine: {
    color: C.white,
  },
  bubbleTextTheirs: {
    color: C.charcoal,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 4,
  },
  statusIcon: {
    marginRight: 2,
  },
  statusText: {
    fontSize: 11,
    color: C.charcoal50,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  retryText: {
    fontSize: 11,
    color: C.wine,
    fontWeight: '600',
  },
  theirTimestamp: {
    fontSize: 11,
    color: C.charcoal50,
    paddingLeft: 4,
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: GRID,
    paddingHorizontal: GRID * 2,
    paddingTop: GRID * 1.5,
    borderTopWidth: 1,
    borderTopColor: C.charcoal08,
    backgroundColor: C.page,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: C.inputBg,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(45,45,45,0.15)',
    paddingHorizontal: GRID * 2,
    paddingVertical: GRID * 1.25,
    minHeight: GRID * 5.5,
    justifyContent: 'center',
  },
  input: {
    fontSize: 15,
    color: C.charcoal,
    maxHeight: 120,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: C.myBubble,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    backgroundColor: C.charcoal12,
  },
  sendBtnPressed: {
    opacity: 0.85,
  },

  emptyThread: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: GRID * 8,
  },
  emptyThreadText: {
    fontSize: 14,
    color: C.charcoal50,
  },

  skeletonList: {
    flex: 1,
    paddingHorizontal: GRID * 2,
    paddingTop: GRID * 2,
    gap: GRID * 1.5,
  },
  skeletonBubble: {
    height: 44,
    borderRadius: 20,
    maxWidth: '65%',
  },
  skeletonBubbleMine: {
    alignSelf: 'flex-end',
  },
  skeletonBubbleTheirs: {
    alignSelf: 'flex-start',
  },
});
