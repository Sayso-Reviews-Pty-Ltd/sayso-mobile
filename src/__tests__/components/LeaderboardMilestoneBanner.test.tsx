import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { LeaderboardMilestoneBanner } from '../../components/leaderboard/LeaderboardMilestoneBanner';

// Ionicons is mocked globally in setup.ts as a Text element with testID="icon-{name}"

describe('LeaderboardMilestoneBanner', () => {
  // ─── Null guard ───────────────────────────────────────────────────────────

  it('renders nothing for a negative review count', () => {
    const { toJSON } = render(<LeaderboardMilestoneBanner reviewCount={-1} />);
    expect(toJSON()).toBeNull();
  });

  // ─── Tier label ───────────────────────────────────────────────────────────

  it('shows Scout tier for 0 reviews', () => {
    render(<LeaderboardMilestoneBanner reviewCount={0} />);
    expect(screen.getByText(/Scout/)).toBeTruthy();
  });

  it('shows Rookie tier for 5 reviews', () => {
    render(<LeaderboardMilestoneBanner reviewCount={5} />);
    expect(screen.getByText(/Rookie/)).toBeTruthy();
  });

  it('shows Contributor tier for 15 reviews', () => {
    render(<LeaderboardMilestoneBanner reviewCount={15} />);
    expect(screen.getByText(/Contributor/)).toBeTruthy();
  });

  it('shows Regular tier for 30 reviews', () => {
    render(<LeaderboardMilestoneBanner reviewCount={30} />);
    expect(screen.getByText(/Regular/)).toBeTruthy();
  });

  it('shows Expert tier for 50 reviews', () => {
    render(<LeaderboardMilestoneBanner reviewCount={50} />);
    expect(screen.getByText(/Expert/)).toBeTruthy();
  });

  it('shows Elite tier for 100 reviews', () => {
    render(<LeaderboardMilestoneBanner reviewCount={100} />);
    expect(screen.getByText(/Elite/)).toBeTruthy();
  });

  it('shows Legend tier for 200 reviews', () => {
    render(<LeaderboardMilestoneBanner reviewCount={200} />);
    expect(screen.getByText(/Legend/)).toBeTruthy();
  });

  // ─── Suffix text ──────────────────────────────────────────────────────────

  it('shows "You\'ve reached Legend!" at 200 reviews', () => {
    render(<LeaderboardMilestoneBanner reviewCount={200} />);
    expect(screen.getByText(/You've reached Legend!/)).toBeTruthy();
  });

  it('shows plural "N more reviews to level up" for Scout (5 away)', () => {
    render(<LeaderboardMilestoneBanner reviewCount={0} />);
    expect(screen.getByText(/5 more reviews to level up/)).toBeTruthy();
  });

  it('shows singular "1 more review to level up" at 199 (1 away from Legend)', () => {
    render(<LeaderboardMilestoneBanner reviewCount={199} />);
    expect(screen.getByText(/1 more review to level up/)).toBeTruthy();
  });

  it('shows correct remaining count at mid-tier (Rookie at 10 → 5 away)', () => {
    render(<LeaderboardMilestoneBanner reviewCount={10} />);
    expect(screen.getByText(/5 more reviews to level up/)).toBeTruthy();
  });

  // ─── Renders for edge values ──────────────────────────────────────────────

  it('renders for 0 reviews (Scout, new user)', () => {
    const { toJSON } = render(<LeaderboardMilestoneBanner reviewCount={0} />);
    expect(toJSON()).not.toBeNull();
  });

  it('renders correctly for reviews well above Legend threshold', () => {
    render(<LeaderboardMilestoneBanner reviewCount={1000} />);
    expect(screen.getByText(/Legend/)).toBeTruthy();
    expect(screen.getByText(/You've reached Legend!/)).toBeTruthy();
  });
});
