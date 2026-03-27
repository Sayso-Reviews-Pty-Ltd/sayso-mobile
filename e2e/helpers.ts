import type { Page } from '@playwright/test';

// Production redirects apex → www; use www so session cookies match post-login navigations.
export const BASE = process.env.E2E_BASE_URL ?? 'https://www.sayso.co.za';

const LOGIN_TIMEOUT_MS = 60_000;

/**
 * Submit login and wait until we either leave `/login` or see the standard
 * bad-credentials message. CI runners and cold prod can exceed 10–15s easily.
 */
export async function signInWithPersonalAccount(
  page: Page,
  email: string,
  password: string,
  options: { timeoutMs?: number } = {},
): Promise<'authenticated' | 'bad_credentials'> {
  const timeoutMs = options.timeoutMs ?? LOGIN_TIMEOUT_MS;
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.getByPlaceholder(/enter your password/i).fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Matches strings from sayso-web `getClearAuthMessage` (login) — not only wrong-password copy.
  const loginErrorPattern =
    /Incorrect email or password|We could not sign you in|Too many attempts|verify your email before signing|could not reach authentication/i;

  try {
    await page.waitForURL((url) => !url.pathname.toLowerCase().includes('/login'), {
      timeout: timeoutMs,
    });
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
    return 'authenticated';
  } catch {
    const pollUntil = Date.now() + 30_000;
    while (Date.now() < pollUntil) {
      const href = page.url();
      if (!href.toLowerCase().includes('/login')) {
        await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
        return 'authenticated';
      }
      const banner = page.getByText(loginErrorPattern).first();
      if (await banner.isVisible().catch(() => false)) {
        const text = (await banner.textContent().catch(() => '')) || '';
        if (/verify your email/i.test(text)) {
          throw new Error('E2E account must have a verified email before this test can sign in.');
        }
        return 'bad_credentials';
      }
      await page.waitForTimeout(400);
    }
    throw new Error(
      `E2E login stalled: still on /login after ${timeoutMs}ms + 30s poll. URL: ${page.url()}`,
    );
  }
}

export async function goToLogin(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');

  const emailInput = page.getByPlaceholder('you@example.com');
  if (!(await emailInput.isVisible())) {
    const launchLogin = page.getByText('Log In').first();
    const getStarted = page.getByText('Get Started').first();
    if (await launchLogin.isVisible()) {
      await launchLogin.click();
    } else if (await getStarted.isVisible()) {
      await getStarted.click();
      const loginTab = page.getByText('Login', { exact: true }).first();
      if (await loginTab.isVisible()) {
        await loginTab.click();
      }
    }
    await page.waitForTimeout(500);
  }
}

export async function goToRegister(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Register' }).click();
  await page.waitForTimeout(300);
}

export async function goToForgotPassword(page: Page) {
  await page.goto(`${BASE}/forgot-password`);
  await page.waitForLoadState('networkidle');
}
