import type { Page } from '@playwright/test';

export const BASE = process.env.E2E_BASE_URL ?? 'https://sayso.co.za';

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

  const badPassword = page.getByText(/Incorrect email or password/i).first();

  try {
    await page.waitForURL((url) => !url.pathname.toLowerCase().includes('/login'), {
      timeout: timeoutMs,
    });
    return 'authenticated';
  } catch {
    await badPassword.waitFor({ state: 'visible', timeout: 15_000 });
    return 'bad_credentials';
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
