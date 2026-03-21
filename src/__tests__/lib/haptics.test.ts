import { Platform } from 'react-native';

// Override the global setup mock to add selectionAsync
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

import * as Haptics from 'expo-haptics';
import { haptics } from '../../lib/haptics';

const mockImpact = Haptics.impactAsync as jest.Mock;
const mockNotification = Haptics.notificationAsync as jest.Mock;
const mockSelection = (Haptics as unknown as { selectionAsync: jest.Mock }).selectionAsync;

describe('haptics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure platform is ios so supported() returns true
    (Platform as unknown as { OS: string }).OS = 'ios';
  });

  describe('tap()', () => {
    it('calls impactAsync with Light style', () => {
      haptics.tap();
      expect(mockImpact).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('calls impactAsync exactly once', () => {
      haptics.tap();
      expect(mockImpact).toHaveBeenCalledTimes(1);
    });
  });

  describe('confirm()', () => {
    it('calls impactAsync with Medium style', () => {
      haptics.confirm();
      expect(mockImpact).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
    });
  });

  describe('success()', () => {
    it('calls notificationAsync with Success type', () => {
      haptics.success();
      expect(mockNotification).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success,
      );
    });
  });

  describe('milestone()', () => {
    it('calls notificationAsync with Success type', () => {
      haptics.milestone();
      expect(mockNotification).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success,
      );
    });
  });

  describe('error()', () => {
    it('calls notificationAsync with Error type', () => {
      haptics.error();
      expect(mockNotification).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error,
      );
    });
  });

  describe('selection()', () => {
    it('calls selectionAsync', () => {
      haptics.selection();
      expect(mockSelection).toHaveBeenCalledTimes(1);
    });
  });

  describe('platform guard', () => {
    it('does not call impactAsync on web platform', () => {
      (Platform as unknown as { OS: string }).OS = 'web';
      haptics.tap();
      haptics.confirm();
      expect(mockImpact).not.toHaveBeenCalled();
    });

    it('does not call notificationAsync on web platform', () => {
      (Platform as unknown as { OS: string }).OS = 'web';
      haptics.success();
      haptics.milestone();
      haptics.error();
      expect(mockNotification).not.toHaveBeenCalled();
    });

    it('does not call selectionAsync on web platform', () => {
      (Platform as unknown as { OS: string }).OS = 'web';
      haptics.selection();
      expect(mockSelection).not.toHaveBeenCalled();
    });

    it('fires on android', () => {
      (Platform as unknown as { OS: string }).OS = 'android';
      haptics.tap();
      expect(mockImpact).toHaveBeenCalledTimes(1);
    });
  });
});
