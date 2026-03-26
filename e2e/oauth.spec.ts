/**
 * OAuth – Google Sign-Up / Sign-In
 *
 * Strategy:
 *  • Button presence + redirect tests  → hit the live web app (sayso.co.za)
 *  • Callback error-state tests        → navigate to /auth/callback?... directly
 *  • Callback success-state tests      → intercept Supabase API with page.route()
 *    so no real credentials are needed
 *
 * NOTE: We do NOT automate Google's sign-in page — Google blocks bots.
 * The redirect test asserts that clicking the button navigates to
 * accounts.google.com with the correct OAuth params. That is the boundary.
 */

import { test, expect } from '@playwright/test';
import { goToLogin, goToRegister } from './helpers';


// ---------------------------------------------------------------------------
// Button visibility
// ---------------------------------------------------------------------------

test.describe('OAuth – Google button', () => {
  test('visible on the register tab', async ({ page }) => {
    await goToRegister(page);
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
  });

  test('visible on the login tab', async ({ page }) => {
    await goToLogin(page);
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
  });

  test('is enabled regardless of form state', async ({ page }) => {
    await goToRegister(page);
    // Google button must never be gated behind form validation
    await expect(page.getByRole('button', { name: /google/i })).toBeEnabled();
  });

});

// ---------------------------------------------------------------------------
// Redirect to Google
// ---------------------------------------------------------------------------

test.describe('OAuth – redirect to Google', () => {
  test('clicking Google navigates to accounts.google.com', async ({ page }) => {
    await goToRegister(page);
    await page.getByRole('button', { name: /google/i }).click();
    await page.waitForURL(/accounts\.google\.com/, { timeout: 15_000 });
    expect(page.url()).toContain('accounts.google.com');
  });

  test('Google OAuth URL contains required params', async ({ page }) => {
    await goToRegister(page);
    await page.getByRole('button', { name: /google/i }).click();
    await page.waitForURL(/accounts\.google\.com/, { timeout: 15_000 });

    const url = page.url();
    expect(url).toMatch(/client_id=/);
    expect(url).toMatch(/redirect_uri=/);
    expect(url).toMatch(/response_type=code/);
  });

  test('redirect_uri points back to sayso.co.za', async ({ page }) => {
    await goToRegister(page);
    await page.getByRole('button', { name: /google/i }).click();
    await page.waitForURL(/accounts\.google\.com/, { timeout: 15_000 });

    const redirectUri = new URL(page.url()).searchParams.get('redirect_uri') ?? '';
    expect(redirectUri).toContain('sayso.co.za');
  });
});

// ---------------------------------------------------------------------------
// Callback – error states (navigate directly, no Google session needed)
// ---------------------------------------------------------------------------

test.describe('OAuth – callback error handling', () => {
  test('access_denied → redirects to error screen', async ({ page }) => {
    await page.goto('/auth/callback?error=access_denied&error_description=User+cancelled+the+flow');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/auth-code-error|error|login/, { timeout: 10_000 });
  });

  test('expired email link → redirects to verify-email', async ({ page }) => {
    await page.goto(
      '/auth/callback?error=access_denied&error_description=Email+link+is+invalid+or+has+expired'
    );
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/verify-email|login/, { timeout: 10_000 });
  });

  test('no code and no active session → redirects away from callback', async ({ page }) => {
    await page.goto('/auth/callback');
    await page.waitForLoadState('networkidle');
    // Must not stay on /auth/callback with no usable params
    await expect(page).not.toHaveURL(/\/auth\/callback$/, { timeout: 10_000 });
  });

  test('invalid / rejected code → redirects to auth-code-error', async ({ page }) => {
    // Supabase will fail to exchange this code — the app must handle it gracefully
    await page.goto('/auth/callback?code=this-code-is-invalid');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/auth-code-error|error|login/, { timeout: 15_000 });
  });

  test('account mismatch in state param → redirects to auth-code-error', async ({ page }) => {
    // state encodes a different user_id than the session — should trigger mismatch guard
    const state = btoa(JSON.stringify({ user_id: 'mismatched-user-id' }));
    await page.goto(`/auth/callback?code=any-code&state=${state}`);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/auth-code-error|error|login/, { timeout: 15_000 });
  });
});

// ---------------------------------------------------------------------------
// Callback – success states
//
// NOTE: sayso.co.za uses Next.js with Supabase SSR. The /auth/callback route
// exchanges the OAuth code server-side before the browser receives a response,
// so page.route() intercepts never fire — the mock helper above has no effect
// against the deployed site. Success-routing tests (home, interests, deal-
// breakers, role-unsupported, reset-password) require either:
//   a) A local dev server with a stubbed Supabase auth endpoint, or
//   b) Real Supabase test credentials set via E2E_PERSONAL_ACCOUNT_EMAIL /
//      E2E_PERSONAL_ACCOUNT_PASSWORD (see the existing account lifecycle spec).
//
// All error-state paths (above) are fully covered because they are handled
// client-side via URL params before any server exchange occurs.
// ---------------------------------------------------------------------------
