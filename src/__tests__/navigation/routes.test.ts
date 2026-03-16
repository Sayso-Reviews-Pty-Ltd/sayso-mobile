import { routes } from '../../navigation/routes';

describe('routes', () => {
  it('generates correct static routes', () => {
    expect(routes.home()).toBe('/home');
    expect(routes.saved()).toBe('/saved');
    expect(routes.profile()).toBe('/profile');
    expect(routes.notifications()).toBe('/notifications');
  });

  it('generates leaderboard route without tab param', () => {
    expect(routes.leaderboard()).toBe('/leaderboard');
  });

  it('generates leaderboard route with tab param', () => {
    expect(routes.leaderboard('contributors')).toBe('/leaderboard?tab=contributors');
  });

  it('generates businessDetail with id', () => {
    expect(routes.businessDetail('abc123')).toBe('/business/abc123');
  });

  it('generates dmThread with threadId', () => {
    expect(routes.dmThread('thread456')).toBe('/dm/thread456');
  });

  it('generates writeReview without reviewId', () => {
    expect(routes.writeReview('business', 'abc')).toBe('/write-review/business/abc');
  });

  it('generates writeReview with reviewId — encodes special chars', () => {
    expect(routes.writeReview('event', 'abc', 'id=one&two')).toBe(
      '/write-review/event/abc?reviewId=id%3Done%26two'
    );
  });

  it('generates publicProfile with username', () => {
    expect(routes.publicProfile('hilarion')).toBe('/profile/hilarion');
  });

  it('generates reviewer with id', () => {
    expect(routes.reviewer('reviewer-1')).toBe('/reviewer/reviewer-1');
  });
});
