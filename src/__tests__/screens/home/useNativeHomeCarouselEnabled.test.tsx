import { renderHook } from '@testing-library/react-native';
import { track } from '../../../lib/telemetry';
import { useNativeHomeCarouselEnabled } from '../../../screens/tabs/home/carousel/useNativeHomeCarouselEnabled';

let mockHomeNativeCarouselEnabled = false;

jest.mock('../../../lib/env', () => ({
  ENV: {
    get homeNativeCarouselEnabled() {
      return mockHomeNativeCarouselEnabled;
    },
  },
}));

jest.mock('../../../lib/telemetry', () => ({
  track: jest.fn(),
}));

const mockedTrack = track as jest.MockedFunction<typeof track>;

describe('useNativeHomeCarouselEnabled', () => {
  beforeEach(() => {
    mockHomeNativeCarouselEnabled = false;
    mockedTrack.mockReset();
  });

  it('returns false and does not track when native carousel is disabled', () => {
    const { result } = renderHook(() => useNativeHomeCarouselEnabled());

    expect(result.current).toBe(false);
    expect(mockedTrack).not.toHaveBeenCalled();
  });

  it('tracks native carousel exposure once when enabled', () => {
    mockHomeNativeCarouselEnabled = true;

    const firstRender = renderHook(() => useNativeHomeCarouselEnabled());
    expect(firstRender.result.current).toBe(true);
    expect(mockedTrack).toHaveBeenCalledTimes(1);

    const secondRender = renderHook(() => useNativeHomeCarouselEnabled());
    expect(secondRender.result.current).toBe(true);
    expect(mockedTrack).toHaveBeenCalledTimes(1);
    expect(mockedTrack).toHaveBeenCalledWith('rollout.home_native_carousel_exposed', {
      platform: expect.any(String),
    });
  });
});
