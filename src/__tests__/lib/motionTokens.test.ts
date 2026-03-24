import {
  getEnterDelay,
  getExitDelay,
  getMotionPhaseTargets,
  resolveMotionRole,
  STAGGER_MAX_DELAY,
} from '../../components/motion/motionTokens';

describe('motion tokens', () => {
  it('maps legacy variants to hierarchy roles', () => {
    expect(resolveMotionRole('header')).toBe('hero');
    expect(resolveMotionRole('input')).toBe('subheading');
    expect(resolveMotionRole('card')).toBe('support');
  });

  it('uses deterministic forward stagger on enter', () => {
    const d0 = getEnterDelay('listItem', 0);
    const d1 = getEnterDelay('listItem', 1);
    const d2 = getEnterDelay('listItem', 2);
    expect(d0).toBeLessThan(d1);
    expect(d1).toBeLessThan(d2);
  });

  it('uses deterministic reverse stagger on exit', () => {
    const maxIndex = 6;
    const first = getExitDelay('listItem', 0, maxIndex);
    const middle = getExitDelay('listItem', 3, maxIndex);
    const last = getExitDelay('listItem', 6, maxIndex);
    expect(first).toBeGreaterThan(middle);
    expect(middle).toBeGreaterThan(last);
  });

  it('caps stagger delays at max', () => {
    const enter = getEnterDelay('support', 999);
    const exit = getExitDelay('support', 0, 999);
    expect(enter).toBeLessThanOrEqual(STAGGER_MAX_DELAY);
    expect(exit).toBeLessThanOrEqual(STAGGER_MAX_DELAY);
  });

  it('returns spring-based enter/exit targets when motion is enabled', () => {
    const enter = getMotionPhaseTargets('support', 'enter', false);
    const exit = getMotionPhaseTargets('support', 'exit', false);

    expect(enter.useSpring).toBe(true);
    expect(enter.opacityFrom).toBe(0);
    expect(enter.opacityTo).toBe(1);
    expect(enter.translateYFrom).toBeGreaterThan(0);
    expect(enter.translateYTo).toBe(0);

    expect(exit.useSpring).toBe(true);
    expect(exit.opacityFrom).toBe(1);
    expect(exit.opacityTo).toBe(0);
    expect(exit.translateYFrom).toBe(0);
    expect(exit.translateYTo).toBeLessThan(0);
  });

  it('returns fade-only targets in reduced-motion mode', () => {
    const enter = getMotionPhaseTargets('hero', 'enter', true);
    const exit = getMotionPhaseTargets('hero', 'exit', true);

    expect(enter.useSpring).toBe(false);
    expect(enter.translateYFrom).toBe(0);
    expect(enter.translateYTo).toBe(0);
    expect(enter.scaleFrom).toBe(1);
    expect(enter.scaleTo).toBe(1);

    expect(exit.useSpring).toBe(false);
    expect(exit.translateYFrom).toBe(0);
    expect(exit.translateYTo).toBe(0);
    expect(exit.scaleFrom).toBe(1);
    expect(exit.scaleTo).toBe(1);
  });
});
