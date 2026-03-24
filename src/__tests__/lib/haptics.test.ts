import { Platform } from 'react-native';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

import * as Haptics from 'expo-haptics';
import { haptics } from '../../lib/haptics';

const mockImpact = Haptics.impactAsync as jest.Mock;

async function flushMicrotasks() {
  await Promise.resolve();
}

describe('haptics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Platform as unknown as { OS: string }).OS = 'ios';
  });

  describe('navigation()', () => {
    it('calls impactAsync with Light style', () => {
      haptics.navigation();
      expect(mockImpact).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });
  });

  describe('confirm() and complete()', () => {
    it('calls impactAsync with Medium style', () => {
      haptics.confirm();
      expect(mockImpact).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
    });

    it('uses medium impact for complete()', () => {
      haptics.complete();
      expect(mockImpact).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
      expect(mockImpact).toHaveBeenCalledTimes(1);
    });
  });

  describe('error()', () => {
    it('fires a double light impact with short gap', async () => {
      jest.useFakeTimers();
      haptics.error();
      expect(mockImpact).toHaveBeenCalledTimes(1);
      await flushMicrotasks();
      jest.advanceTimersByTime(70);
      await flushMicrotasks();
      expect(mockImpact).toHaveBeenCalledTimes(2);
      expect(mockImpact).toHaveBeenNthCalledWith(1, Haptics.ImpactFeedbackStyle.Light);
      expect(mockImpact).toHaveBeenNthCalledWith(2, Haptics.ImpactFeedbackStyle.Light);
    });
  });

  describe('platform guard', () => {
    it('does not call impactAsync on web platform', () => {
      (Platform as unknown as { OS: string }).OS = 'web';
      haptics.navigation();
      haptics.confirm();
      haptics.complete();
      expect(mockImpact).not.toHaveBeenCalled();
    });

    it('does not call error pattern on web platform', async () => {
      jest.useFakeTimers();
      (Platform as unknown as { OS: string }).OS = 'web';
      haptics.error();
      await flushMicrotasks();
      jest.advanceTimersByTime(80);
      await flushMicrotasks();
      expect(mockImpact).not.toHaveBeenCalled();
    });

    it('fires on android', () => {
      (Platform as unknown as { OS: string }).OS = 'android';
      haptics.navigation();
      expect(mockImpact).toHaveBeenCalledTimes(1);
    });
  });
});
