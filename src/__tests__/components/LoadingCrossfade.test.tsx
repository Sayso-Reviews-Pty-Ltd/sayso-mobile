import { View } from 'react-native';
import { render } from '@testing-library/react-native';
import { LoadingCrossfade } from '../../components/LoadingCrossfade';

jest.mock('../../hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));

describe('LoadingCrossfade', () => {
  it('keeps skeleton and content overlapped during loading swap', () => {
    const { getByTestId, queryAllByTestId, rerender } = render(
      <LoadingCrossfade loading skeleton={<View testID="skeleton" />}>
        <View testID="content" />
      </LoadingCrossfade>
    );

    expect(getByTestId('skeleton')).toBeTruthy();
    expect(queryAllByTestId('content')).toHaveLength(0);

    rerender(
      <LoadingCrossfade loading={false} skeleton={<View testID="skeleton" />}>
        <View testID="content" />
      </LoadingCrossfade>
    );

    expect(getByTestId('content')).toBeTruthy();
    expect(queryAllByTestId('skeleton').length).toBeGreaterThan(0);
  });
});
